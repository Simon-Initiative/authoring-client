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

const emptyContent = ContentState.createFromText(' ');

export type ContiguousTextPair = [ContiguousText, ContiguousText];

export enum ContiguousTextMode {
  Regular,
  SimpleText,
}

export type ContiguousTextParams = {
  content?: ContentState,
  entityEditCount?: number,
  mode?: ContiguousTextMode,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContiguousText',
  elementType: '#text',
  content: emptyContent,
  mode: ContiguousTextMode.Regular,
  entityEditCount: 0,
  guid: '',
};

export enum InlineStyles {
  Bold = 'BOLD',
  Italic = 'ITALIC',
  Strikethrough = 'STRIKETHROUGH',
  Highlight = 'HIGHLIGHT',
  Var = 'VAR',
  Term = 'TERM',
  Foreign = 'FOREIGN',
  Subscript = 'SUBSCRIPT',
  Superscript = 'SUPERSCRIPT',
  BidirectionTextOverride = 'BDO',
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
    return fromDraft(this.content, this.mode === ContiguousTextMode.SimpleText);
  }

  // Return the OLI ID of the first paragraph in the text block
  getFirstReferenceId(): string | undefined {
    const firstBlock = this.content.getFirstBlock();
    if (firstBlock) {
      return (firstBlock.data as Immutable.Map<string, string>).get('id');
    }
    return undefined;
  }

  getAllReferenceIds(): string[] {
    return this.content.getBlocksAsArray()
      .map(block => (block.data as Immutable.Map<string, string>).get('id'));
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
              overlaps = overlaps || selection.hasEdgeWithin(block.key, start, end);
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
            (c) => { styles = c.getStyle(); return c.style.size !== 0; },
            (start: number, end: number) => {
              if (selection.hasEdgeWithin(block.key, start, end)) {
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
    type ContentBlock = any; // so much for type safety

    const rev = selection.getIsBackward(); // its reversed if anchor is after focus
    const anchorKey = selection.getAnchorKey(); // key of starting ContentBlock
    const anchorOffset = selection.getAnchorOffset(); // anchor offset from beginning
    const focusKey = selection.getFocusKey(); // key of ending ContentBlock
    const focusOffset = selection.getFocusOffset(); // focus offset from beginning
    const blocks: Immutable.OrderedMap<string, ContentBlock> = this.content.getBlockMap();

    // want blocks from anchorKey to focusKey, or focusKey to anchorKey if rev
    const startKey = rev ? focusKey : anchorKey;
    const endKey = rev ? anchorKey : focusKey;
    let selectedBlocks = blocks.skipUntil((_, x) => x === startKey);
    let saw = false; // saw used as a hack to get an inclusive upper bound on takeUntil
    selectedBlocks = selectedBlocks.takeUntil((_, x) => saw || (x === endKey && !(saw = true)));

    // Determine whether we need to apply or remove the style based on the selection
    // If the current selection is all styled, unstyle it.
    // If the current selection is partially styled, style it entirely.
    const startOffset = rev ? focusOffset : anchorOffset;
    const endOffset = rev ? anchorOffset : focusOffset;
    let allStyled = true;
    selectedBlocks.forEach((block, key) => {
      const chars = block.characterList.toArray().map(x => x.style);
      const text = block.text;
      const len = chars.length;
      const start = key === startKey ? startOffset : 0;
      const end = key === endKey ? endOffset : len;
      for (let i = start; i < end; i += 1) {
        // if the styling isn't the entire section
        if (!chars[i].has(style) && text[i].trim() !== '') {
          return allStyled = false; // break out of the forEach
        }
      }
    });

    let content = allStyled
      ? Modifier.removeInlineStyle(this.content, selection.getRawSelectionState(), style)
      : Modifier.applyInlineStyle(this.content, selection.getRawSelectionState(), style);

    // handle contradictory styling
    if (!allStyled && (style === InlineStyles.Subscript || style === InlineStyles.Superscript)) {
      content = Modifier.removeInlineStyle(
        content, selection.getRawSelectionState(),
        style === InlineStyles.Subscript ? InlineStyles.Superscript : InlineStyles.Subscript);
    }
    return this.with({ content });
  }

  updateEntity(key: string, data: Object) {
    return new ContiguousText().with({
      guid: this.guid,
      content: this.content.replaceEntityData(key, data),
      entityEditCount: this.entityEditCount + 1,
      mode: this.mode,
    });
  }

  // Replace's an entity's data and the text
  replaceEntity(key: string, type: string, mutable: boolean, data: Object, text: string) {

    // Remove the current entity
    let model = this.removeEntity(key);

    // Update the text
    const matched = getAllEntities(this.content).filter(e => e.entityKey === key);
    if (matched.length === 1) {
      const rawSelection = new SelectionState({
        anchorKey: matched[0].range.contentBlock.key,
        focusKey: matched[0].range.contentBlock.key,
        anchorOffset: matched[0].range.start,
        focusOffset: matched[0].range.end,
      });
      let selection = new TextSelection(rawSelection);
      model = model.with({ content: Modifier.replaceText(model.content, rawSelection, text) });

      const originalLength = (matched[0].range.end - matched[0].range.start);

      // Adjust the selection to account for potential differences the length of
      // the original vs replacement text.
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
      anchorKey: info.range.contentBlock.key,
      focusKey: info.range.contentBlock.key,
      anchorOffset: info.range.start,
      focusOffset: info.range.end,
    });
    const selection = new TextSelection(rawSelection);

    // Some of the entity data objects are regular objects and do not
    // support clone
    const clone = info.entity.data.clone !== undefined
      ? info.entity.data.clone()
      : Object.assign({}, info.entity.data);

    return removed.addEntity(
      info.entity.type, info.entity.mutability === 'MUTABLE', clone, selection);

  }

  removeEntity(key: string): ContiguousText {
    return this.with({
      content: internalRemoveEntity(this.content, (k, e) => k === key),
      entityEditCount: this.entityEditCount + 1,
    });
  }

  addEntity(
    type: string, isMutable: boolean, data: Object, selection: TextSelection): ContiguousText {

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
      entityEditCount: this.entityEditCount + 1,
    });
  }

  insertEntity(
    type: string, isMutable: boolean, data: Object,
    selection: TextSelection, backingText: string): ContiguousText {

    const mutability = isMutable ? 'MUTABLE' : 'IMMUTABLE';
    const selectionState = selection.getRawSelectionState();

    let contentState = this.content;

    // Create the entity
    contentState = contentState.createEntity(type, mutability, data);
    const entityKey = contentState.getLastCreatedEntityKey();

    // Insert the backing text with entity
    contentState = Modifier.replaceText(
      contentState, selectionState, backingText, undefined, entityKey);

    // Add a space if this new entity results in none at the
    // end of the line
    const block = this.content.getBlockForKey(selectionState.getFocusKey());

    if (
      (selectionState.getIsBackward()
        && selectionState.getAnchorOffset() === block.text.length) ||
      (!selectionState.getIsBackward()
        && selectionState.getFocusOffset() === block.text.length)) {

      contentState = appendText(block, contentState, '  ');
    }

    return this.with({
      content: contentState,
      entityEditCount: this.entityEditCount + 1,
    });
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

  // Returns true if the contiguous text contains one block and
  // the text in that block is empty or contains all spaces
  isEffectivelyEmpty(): boolean {
    return this.content.getBlockMap().size === 1
      && this.content.getFirstBlock().text.trim() === '';
  }

  // Returns true if the selection is collapsed and the cursor is
  // positioned in the last block and no text other than spaces
  // follows the cursor
  isCursorAtEffectiveEnd(textSelection: TextSelection): boolean {
    const last = this.content.getLastBlock();
    return textSelection.isCollapsed()
      && last.key === textSelection.getAnchorKey()
      && (last.text.length <= textSelection.getAnchorOffset()
        || (last.text as string).substr(textSelection.getAnchorOffset()).trim() === '');
  }

  // Returns true if the selection is collapsed and is at the
  // very beginning of the first block
  isCursorAtBeginning(textSelection: TextSelection): boolean {
    const first = this.content.getFirstBlock();
    return textSelection.isCollapsed()
      && first.key === textSelection.getAnchorKey()
      && textSelection.getAnchorOffset() === 0;
  }

  updateAllInputRefs(itemMap: Object): ContiguousText {
    const content = getEntities(EntityTypes.input_ref, this.content)
      .reduce(
        (contentState, info) => {
          if (itemMap[info.entity.data['@input']] !== undefined) {
            return contentState.mergeEntityData(
              info.entityKey, { '@input': itemMap[info.entity.data['@input']] });
          }

          return contentState;
        },
        this.content);

    return this.with({ content });
  }

  extractPlainText(): Maybe<string> {

    const blocks = this.content.getBlocksAsArray();
    const unstyled = blocks.filter(b => b.type === 'unstyled');

    if (unstyled.length > 0) {
      return Maybe.just(unstyled[0].text);
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
    // Return nothing if the selection spans multiple blocks
    if (selection.getAnchorKey() !== selection.getFocusKey()) {
      return Maybe.nothing();
    }

    // Return nothing if there is no selection
    if (selection.getAnchorOffset() === selection.getFocusOffset()) {
      return Maybe.nothing();
    }

    // Return nothing if we somehow cannot find this block
    const block = this.content.getBlockForKey(selection.getAnchorKey());
    if (block === undefined) {
      return Maybe.nothing();
    }

    const text: string = block.text;
    // >= is correct here instead of >, since the focus offset value is exclusive
    if (text.length >= selection.getAnchorOffset() && text.length >= selection.getFocusOffset()) {

      // We must be careful to handle reverse selections
      const begin = selection.getAnchorOffset() < selection.getFocusOffset()
        ? selection.getAnchorOffset() : selection.getFocusOffset();
      const end = selection.getAnchorOffset() > selection.getFocusOffset()
        ? selection.getAnchorOffset() : selection.getFocusOffset();

      return Maybe.just(text.substring(begin, end));
    }

    // Return nothing if somehow one or both of the offsets exceeds the
    // length of the backing block text
    return Maybe.nothing();
  }
}
