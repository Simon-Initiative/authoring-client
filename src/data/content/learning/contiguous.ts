import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentState, SelectionState, Modifier, Entity, convertFromHTML } from 'draft-js';
import { augment, ensureIdGuidPresent } from 'data/content/common';
import { cloneContent } from 'data/content/common/clone';
import { toDraft } from 'data/content/learning/draft/todraft';
import { TextSelection } from 'types/active';
import {
  getEntities, getAllEntities, removeInputRef as removeInputRefDraft, EntityInfo,
  Changes, detectChanges, removeEntity as internalRemoveEntity,
} from 'data/content/learning/draft/changes';
import { EntityTypes } from 'data/content/learning/common';
import { fromDraft } from 'data/content/learning/draft/topersistence';
import createGuid from 'utils/guid';

import { Value, Block, ValueJSON, BlockJSON, InlineJSON, MarkJSON } from 'slate';

import { toSlate } from 'data/content/learning/slate/toslate';
import { toPersistence } from 'data/content/learning/slate/topersistence';

const emptyContent = ContentState.createFromText(' ');

export type ContiguousTextPair = [ContiguousText, ContiguousText];



const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: 'A line of text in a paragraph.',
          },
        ],
      },
    ],
  },
});

export enum ContiguousTextMode {
  Regular,
  SimpleText,
}

export type ContiguousTextParams = {
  content?: ContentState,
  value?: Value,
  entityEditCount?: number,
  mode?: ContiguousTextMode,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContiguousText',
  elementType: '#text',
  value: initialValue,
  content: emptyContent,
  mode: ContiguousTextMode.Regular,
  entityEditCount: 0,
  guid: '',
};

export enum InlineStyles {
  Bold = 'em',
  Italic = 'italic',
  Strikethrough = 'strikethough',
  Highlight = 'highlight',
  Var = 'var',
  Term = 'term',
  Foreign = 'foreign',
  Subscript = 'sub',
  Superscript = 'sup',
  BidirectionTextOverride = 'bdo',
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
  elementType: '#text';
  value: Value;
  content: ContentState;
  entityEditCount: number;
  mode: ContiguousTextMode;
  guid: string;

  constructor(params?: ContiguousTextParams) {
    super(augment(params));
  }

  with(values: ContiguousTextParams) {
    return this.merge(values) as this;
  }

  clone(): ContiguousText {

    const entities = getAllEntities(this.content);

    const updated = entities.reduce((ct: ContiguousText, e) => ct.cloneEntity(e), this);

    return ensureIdGuidPresent(updated.with({
      content: cloneContent(updated.content),
    }));
  }

  static fromPersistence(
    root: Object[], guid: string, mode = ContiguousTextMode.Regular,
    backingTextProvider: Object = null): ContiguousText {
    return new ContiguousText({
      guid,
      mode,
      content: toDraft(root, mode === ContiguousTextMode.SimpleText, backingTextProvider),
      value: toSlate(root, mode === ContiguousTextMode.SimpleText, backingTextProvider),
    });
  }

  static fromText(text: string, guid: string, mode = ContiguousTextMode.Regular): ContiguousText {
    return new ContiguousText({ guid, mode, content: ContentState.createFromText(text) });
  }

  static fromHTML(html: string, guid: string, mode = ContiguousTextMode.Regular): ContiguousText {

    const blocksFromHTML = convertFromHTML(html);
    const content = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap,
    );

    return new ContiguousText({ guid, mode, content });
  }

  toPersistence(): Object {
    return toPersistence(this.value, this.mode === ContiguousTextMode.SimpleText);
  }

  // Return the OLI ID of the first paragraph in the text block
  getFirstReferenceId(): string | undefined {
    const firstBlock = this.content.getFirstBlock();
    if (firstBlock) {
      return (firstBlock.getData() as Immutable.Map<string, string>).get('id');
    }
    return undefined;
  }

  getAllReferenceIds(): string[] {
    return this.content.getBlocksAsArray()
      .map(block => (block.getData() as Immutable.Map<string, string>).get('id'));
  }

  selectionOverlapsEntity(selection: TextSelection): boolean {
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
              overlaps = overlaps || selection.hasEdgeWithin(block.getKey(), start, end);
            },
          );
          return overlaps;
        },
        false);
  }

  // Return a set of strings representing all the styles that are
  // overlapped by the supplied text selection.
  getOverlappingInlineStyles(selection: TextSelection): Immutable.Set<string> {
    return this.content.getBlocksAsArray()
      .reduce(
        (acc, block) => {
          let overlaps: Immutable.Set<string> = acc;
          let styles = Immutable.OrderedSet<string>();
          block.findStyleRanges(
            (c) => { styles = c.getStyle(); return c.getStyle().size !== 0; },
            (start: number, end: number) => {
              if (selection.hasEdgeWithin(block.getKey(), start, end)) {
                overlaps = overlaps.union(styles);
              }
            },
          );
          return overlaps;
        },
        Immutable.Set<string>());
  }

  getEntityAtCursor(selection: TextSelection): Maybe<InlineEntity> {
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

  getEntitiesByType(type: EntityTypes): EntityInfo[] {
    return getEntities(type, this.content);
  }

  toggleStyle(style: InlineStyles, selection: TextSelection): ContiguousText {
    return this;
  }

  updateEntity(key: string, data: Object) {
    return new ContiguousText().with({
      guid: this.guid,
      content: this.content.replaceEntityData(key, data),
      entityEditCount: this.entityEditCount + 1,
      mode: this.mode,
    });
  }

  // Replaces an entity's data and it's corresponding
  // block text.
  replaceEntity(key: string, type: string, mutable: boolean, data: Object, text: string) {

    // Remove the current entity
    let model = this.removeEntity(key);

    // Find the entity in question
    const matched = getAllEntities(this.content).filter(e => e.entityKey === key);
    if (matched.length === 1) {

      // Now update the text
      const rawSelection = new SelectionState({
        anchorKey: matched[0].range.contentBlock.getKey(),
        focusKey: matched[0].range.contentBlock.getKey(),
        anchorOffset: matched[0].range.start,
        focusOffset: matched[0].range.end,
      });
      let selection = new TextSelection(rawSelection);
      model = model.with({ content: Modifier.replaceText(model.content, rawSelection, text) });

      // Adjust the selection to account for potential differences the length of
      // the original vs replacement text.
      const originalLength = (matched[0].range.end - matched[0].range.start);
      selection = selection.merge({
        focusOffset:
          selection.getFocusOffset() - (originalLength - text.length),
      });

      // Now apply the entity as a new one with the updated text in place
      return model.addEntity(type, mutable, data, selection);
    }

  }

  cloneEntity(info: EntityInfo) {

    // 'Cloning' the entity must involve removing it, and re-adding it so
    // that it receives a unique key and is treated as a new entity by Draft.

    const removed = this.removeEntity(info.entityKey);

    const rawSelection = new SelectionState({
      anchorKey: info.range.contentBlock.getKey(),
      focusKey: info.range.contentBlock.getKey(),
      anchorOffset: info.range.start,
      focusOffset: info.range.end,
    });



    const selection = new TextSelection(rawSelection);

    // Some of the entity data objects are regular objects and do not
    // support clone
    const clone = info.entity.getData().clone !== undefined
      ? info.entity.getData().clone()
      : Object.assign({}, info.entity.getData());

    return removed.addEntity(
      info.entity.getType(), info.entity.getMutability() === 'MUTABLE', clone, selection);

  }

  removeEntity(key: string): ContiguousText {
    return this.with({
      content: internalRemoveEntity(this.content, (k, e) => k === key),
      entityEditCount: this.entityEditCount + 1,
    });
  }

  addEntity(
    type: string, isMutable: boolean, data: Object, selection: TextSelection): ContiguousText {

    return this;
  }

  insertEntity(
    type: string, isMutable: boolean, data: Object,
    selection: TextSelection, backingText: string): ContiguousText {
    return this;
  }

  removeInputRef(id: string) {
    return this.with({
      content: removeInputRefDraft(this.content, id),
    });
  }

  detectInputRefChanges(previous: ContiguousText): Changes {
    return detectChanges(EntityTypes.input_ref, '@input', previous.content, this.content);
  }

  split(s: TextSelection): ContiguousTextPair {
    return null;
  }

  // Returns true if the contiguous text contains one block and
  // the text in that block is empty or contains all spaces
  isEffectivelyEmpty(): boolean {
    return this.content.getBlockMap().size === 1
      && this.content.getFirstBlock().getText().trim() === '';
  }

  // Returns true if the selection is collapsed and the cursor is
  // positioned in the last block and no text other than spaces
  // follows the cursor
  isCursorAtEffectiveEnd(textSelection: TextSelection): boolean {
    const last = this.content.getLastBlock();
    return textSelection.isCollapsed()
      && last.getKey() === textSelection.getAnchorKey()
      && (last.getText().length <= textSelection.getAnchorOffset()
        || (last.getText() as string).substr(textSelection.getAnchorOffset()).trim() === '');
  }

  // Returns true if the selection is collapsed and is at the
  // very beginning of the first block
  isCursorAtBeginning(textSelection: TextSelection): boolean {
    const first = this.content.getFirstBlock();
    return textSelection.isCollapsed()
      && first.getKey() === textSelection.getAnchorKey()
      && textSelection.getAnchorOffset() === 0;
  }

  updateAllInputRefs(itemMap: Object): ContiguousText {
    const content = getEntities(EntityTypes.input_ref, this.content)
      .reduce(
        (contentState, info) => {
          if (itemMap[info.entity.getData()['@input']] !== undefined) {
            return contentState.mergeEntityData(
              info.entityKey, { '@input': itemMap[info.entity.getData()['@input']] });
          }

          return contentState;
        },
        this.content);

    return this.with({ content });
  }

  extractPlainText(): Maybe<string> {

    if (this.value.document.nodes.size > 0) {
      const n = this.value.document.nodes.first() as Block;
      let s = '';
      n.nodes.forEach((t) => {
        if (t.object === 'text') {
          s += t.text;
        } else if (t.object === 'inline') {
          t.nodes.forEach((tn) => {
            if (tn.object === 'text') {
              s += tn.text;
            }
          });
        }
      });
      return Maybe.just(s);
    }
    return Maybe.nothing();
  }

  // Accesses the plain text from a selection with a single
  // paragraph of continguous text.  If the selection spans
  // multiple content blocks (i.e. paragraphs) we return Nothing. If
  // the block is not found or the selection offsets exceed the
  // length of the raw text for the block, we return nothing.
  // Otherwise, we return just the raw underlying text substring.

  extractParagraphSelectedText(selection: TextSelection): Maybe<string> {

    return Maybe.nothing();
  }
}
