import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentState, convertFromRaw, SelectionState,
  EditorState, RichUtils, Modifier } from 'draft-js';
import * as common from './common';
import guid from '../../../utils/guid';
import { augment } from '../common';
import { cloneContent } from '../common/clone';
import { toDraft } from './draft/todraft';

import { getEntities, removeInputRef as removeInputRefDraft,
  Changes, detectChanges } from './draft/changes';
import { EntityTypes } from '../learning/common';
import { fromDraft } from './draft/topersistence';

const emptyContent = ContentState.createFromText(' ');

export type ContiguousTextParams = {
  content?: ContentState,
  selection?: SelectionState,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContiguousText',
  content: emptyContent,
  selection: SelectionState.createEmpty('blockKey'),
  guid: '',
};

export enum InlineStyles {
  Bold = 'BOLD',
  Italic = 'ITALIC',
  Strikethrough = 'STRIKETHROUGH',
  Highlight = 'HIGHLIGHT',
  Code = 'CODE',
  Term = 'TERM',
  Foreign = 'FOREIGN',
  Subscript = 'SUBSCRIPT',
  Superscript = 'SUPERSCRIPT',
}


function appendText(contentBlock, contentState, text) {

  const targetRange = new SelectionState({
    anchorKey: contentBlock.key,
    focusKey: contentBlock.key,
    anchorOffset: contentBlock.text.length,
    focusOffset: contentBlock.text.length,
  });

  return Modifier.insertText(
    contentState,
    targetRange,
    text);
}



export class ContiguousText extends Immutable.Record(defaultContent) {

  contentType: 'ContiguousText';
  content: ContentState;
  selection: SelectionState;
  guid: string;

  constructor(params?: ContiguousTextParams) {
    super(augment(params));
  }

  with(values: ContiguousTextParams) {
    return this.merge(values) as this;
  }

  clone() : ContiguousText {
    return this.with({
      content: cloneContent(this.content),
    });
  }

  static fromPersistence(root: Object[], guid: string) : ContiguousText {
    return new ContiguousText({ guid, content: toDraft(root) });
  }

  static fromText(text: string, guid: string) : ContiguousText {
    return new ContiguousText({ guid, content: ContentState.createFromText(text) });
  }

  toPersistence() : Object {
    return fromDraft(this.content);
  }

  hasSelection() : boolean {

    if (this.selection.focusOffset === this.selection.anchorOffset
      && this.selection.focusKey === this.selection.anchorKey) {
      return false;
    }
    return true;
  }

  toggleStyle(style: InlineStyles) : ContiguousText {

    const editorState = EditorState
      .createWithContent(this.content);
    const withSelection = EditorState.forceSelection(editorState, this.selection);

    const updateStyle = RichUtils.toggleInlineStyle(editorState, style);

    const key : string = this.selection.getAnchorKey();

    return this.with({
      content: updateStyle.getCurrentContent(),
      selection: SelectionState.createEmpty(key),
    });

  }

  insertEntity(type: string, isMutable: boolean, data: Object) {

    const mutability = isMutable ? 'MUTABLE' : 'IMMUTABLE';
    let selectionState = this.selection;
    let contentState = this.content;

    // We cannot insert an entity at the beginning of a content block,
    // to handle that case we adjust and add 1 to the focus offset
    if (selectionState.focusOffset === selectionState.anchorOffset
      && selectionState.focusKey === selectionState.anchorKey) {

      if (selectionState.focusOffset === 0) {

        const block = contentState.getBlockForKey(selectionState.anchorKey);
        contentState = appendText(block, contentState, '  ');
        const text = block.getText();

        selectionState = new SelectionState({
          anchorKey: selectionState.anchorKey,
          focusKey: selectionState.focusKey,
          anchorOffset: text.length + 1,
          focusOffset: text.length + 2,
        });
      } else {

        selectionState = new SelectionState({
          anchorKey: selectionState.anchorKey,
          focusKey: selectionState.focusKey,
          anchorOffset: selectionState.anchorOffset,
          focusOffset: selectionState.anchorOffset + 1,
        });
      }
    }

    const block = contentState.getBlockForKey(selectionState.anchorKey);
    const text = block.getText();

    if (text.length < selectionState.focusOffset) {
      contentState = appendText(block, contentState, '  ');
    }

    const contentStateWithEntity = contentState.createEntity(type, mutability, data);
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const contentStateWithLink = Modifier.applyEntity(
      contentState,
      selectionState,
      entityKey,
    );

    return this.with({
      content: contentStateWithLink,
      selection: SelectionState.createEmpty(selectionState.anchorKey),
    });
  }

  removeInputRef(id: string) {
    return this.with({
      content: removeInputRefDraft(this.content, id),
    });
  }

  detectInputRefChanges(previous: ContiguousText) : Changes {
    return detectChanges(EntityTypes.input_ref, '@input', previous.content, this.content);
  }

  tagInputRefsWithType(byId: Object) {

    const content = getEntities(EntityTypes.input_ref, this.content)
      .reduce(
        (contentState, info) => {
          if (byId[info.entity.data['@input']] !== undefined) {
            const type = byId[info.entity.data['@input']].contentType;
            return contentState.mergeEntityData(info.entityKey, { $type: type });
          }

          return contentState;
        },
        this.content);

    return this.with({ content });
  }

  extractPlainText() : Maybe<string> {

    const blocks = this.content.getBlocksAsArray();
    const unstyled = blocks.filter(b => b.type === 'unstyled');

    if (unstyled.length > 0) {
      return Maybe.just(unstyled[0].text);
    }
    return Maybe.nothing();
  }


}


