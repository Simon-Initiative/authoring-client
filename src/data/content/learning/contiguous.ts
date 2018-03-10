import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentState, SelectionState, Modifier, Entity, BlockMap } from 'draft-js';
import { augment } from '../common';
import { cloneContent } from '../common/clone';
import { toDraft } from './draft/todraft';
import { TextSelection } from 'types/active';
import { getEntities, removeInputRef as removeInputRefDraft,
  Changes, detectChanges, removeEntity as internalRemoveEntity} from './draft/changes';
import { EntityTypes } from '../learning/common';
import { fromDraft } from './draft/topersistence';
import createGuid from 'utils/guid';

const emptyContent = ContentState.createFromText(' ');

export type ContiguousTextPair = [ContiguousText, ContiguousText];

export type ContiguousTextParams = {
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContiguousText',
  content: emptyContent,
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

export type InlineEntity = {
  key: string,
  data: Object,
};

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

  selectionOverlapsEntity(selection: TextSelection) : boolean {
    return this.content.getBlocksAsArray()
      .reduce(
        (acc, block) => {
          if (acc) {
            return true;
          }
          let overlaps = false;
          block.findEntityRanges(
            c => c.getEntity() !== null,
            (start: number, end: number) => {
              overlaps = overlaps || selection.hasEdgeWithin(block.key, start, end);
            },
          );
          return overlaps;
        },
        false);
  }

  getEntityAtCursor(selection: TextSelection) : Maybe<InlineEntity> {
    const block = this.content.getBlockForKey(selection.getFocusKey());

    if (block === undefined) {
      return Maybe.nothing();
    }
    const key = block.getEntityAt(selection.getFocusOffset());

    if (key === null) {
      return Maybe.nothing();
    }

    const entity = Entity.get(key);
    return Maybe.just({ key, data: entity.getData() });
  }

  toggleStyle(style: InlineStyles, selection: TextSelection) : ContiguousText {

    // Determine whether we need to apply or remove the style based
    // on the presence of the style at the first character of the
    // selection
    const anchorKey = selection.getAnchorKey();
    const currentContentBlock = this.content.getBlockForKey(anchorKey);
    const start = selection.getAnchorOffset();

    const currentStyles = currentContentBlock.getInlineStyleAt(start);

    const content = currentStyles.has(style)
      ? Modifier.removeInlineStyle(this.content, selection.getRawSelectionState(), style)
      : Modifier.applyInlineStyle(this.content, selection.getRawSelectionState(), style);

    return this.with({
      content,
    });

  }

  updateEntity(key: string, data: Object) {
    return this.with({
      content: this.content.replaceEntityData(key, data),
    });
  }

  removeEntity(key: string) : ContiguousText {
    return this.with({
      content: internalRemoveEntity((k, e) => k === key, this.content),
    });
  }

  addEntity(
    type: string, isMutable: boolean, data: Object, selection: TextSelection) : ContiguousText {

    const mutability = isMutable ? 'MUTABLE' : 'IMMUTABLE';
    let selectionState = selection.getRawSelectionState();
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

  split(s: TextSelection) : ContiguousTextPair {

    // Draft.js splitBlock should only be called when selection is collapsed.
    // So, if it isn't, we adjust the selection to make it collapsed (just for
    // the purpose of this split)
    const raw = s.getRawSelectionState();
    const selection = raw.isCollapsed()
      ? raw
      : raw.merge({
        anchorKey: raw.focusKey,
        anchorOffset: raw.focusOffset,
      });

    // Split the current block
    const split = Modifier.splitBlock(this.content, selection);

    // Now separate the blocks into two arrays, the first up to and including the
    // block we split, and the second being the new block and all after it
    const first = [];
    const second = [];

    let which = first;
    split.getBlocksAsArray()
      .forEach((b) => {
        which.push(b);
        if (b.key === selection.focusKey) {
          which = second;
        }
      });

    // Reconstruct ContentStates
    const secondContent = ContentState.createFromBlockArray(second);
    return [
      this.with({
        content: ContentState.createFromBlockArray(first),
      }),
      this.with({
        guid: createGuid(),
        content: secondContent,
      })];
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


