import * as Immutable from 'immutable';
import { EditorState, AtomicBlockUtils, SelectionState, 
  Modifier, ContentState, CharacterMetadata, ContentBlock } from 'draft-js';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/html/common';

// Append text to a content block
export function appendText(contentBlock, contentState, text) {

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

export function stateFromKey(key: string) : SelectionState {
  return new SelectionState({
    anchorKey: key,
    focusKey: key,
    anchorOffset: 0,
    focusOffset: 1,
  });
}

// A reusable precondition that allows commands to be executed when
// the current editor selection anchor point is not within a 
// set of entity containers specified by entity begin and entity end types
export function containerPrecondition(
  editorState: EditorState,
  beginTypes: EntityTypes[], endTypes: EntityTypes[]) : boolean {

  // Do not allow a pullout to be inserted inside of another pullout, 
  // or example.  They are allowed to be inserted inside of sections.
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const insertionPointKey = selection.getAnchorKey();
  const blocks = contentState.getBlocksAsArray();

  const setKey = (c, p) => {
    c[p] = true;
    return c;
  };

  const beginMap = beginTypes.reduce((c, p) => setKey(c, p), {});
  const endMap = endTypes.reduce((c, p) => setKey(c, p), {});

  let depthCount = 0;
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (block.type === 'atomic') {
      const entityType : string = contentState.getEntity(block.getEntityAt(0)).type;

      if (beginMap[entityType]) {
        depthCount += 1;
      } else if (endMap[entityType]) {
        depthCount -= 1;
      }

    } else if (block.key === insertionPointKey) {
      return depthCount === 0;
    }
  }
  
  return true;

}

export function insertAtomicBlockWithEntity(
  editorState: EditorState, type: EntityTypes, data: Object) {

  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    type,
    'IMMUTABLE',
    data,
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(
    editorState,
    { currentContent: contentStateWithEntity },
  );

  return AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      ' ');
}

export function isAtomic(contentBlock: ContentBlock) : boolean {
  return contentBlock.type === 'atomic';
}

// Determines if we should insert an empty block after the block specified
// by blockKey.  We do this for two cases:
// 1) There are two atomic blocks in a row
// 2) The last block is an atomic block
export function shouldInsertBlock(contentState: ContentState, blockKey: string) : boolean {
  
  const block = contentState.getBlockForKey(blockKey);

  if (block !== null && isAtomic(block)) {

    const nextBlockKey = contentState.getKeyAfter(blockKey);
    if (nextBlockKey !== undefined && nextBlockKey !== null) {

      const nextBlock = contentState.getBlockForKey(nextBlockKey);
      return isAtomic(nextBlock); // Case 1

    } else {
      return true;  // Case 2
    }

  } else {
    return false;
  }
}

// Create draft representation of a title, populating the blocks array
export function createTitle(currentContent, blocks) {
  
  const beginBlockKey = generateRandomKey();
  const contentKey = generateRandomKey();
  const endBlockKey = generateRandomKey();
  
  let content = currentContent;

  content = content.createEntity(
    EntityTypes.title_begin, 'IMMUTABLE', { type: 'title_begin' });
  const beginKey = content.getLastCreatedEntityKey();

  content = content.createEntity(
    EntityTypes.title_end, 'IMMUTABLE', { type: 'title_end' });
  const endKey = content.getLastCreatedEntityKey();

  const beginCharList = Immutable.List().push(
    new CharacterMetadata({ entity: beginKey }));
  const emptyCharList = Immutable.List().push(new CharacterMetadata());
  const endCharList = Immutable.List().push(
    new CharacterMetadata({ entity: endKey }));

  blocks.push(
    new ContentBlock(
      { type: 'atomic', key: beginBlockKey, text: ' ', characterList: beginCharList }));
  blocks.push(
    new ContentBlock(
      { type: 'unstyled', key: contentKey, text: ' ', characterList: emptyCharList }));
  blocks.push(
    new ContentBlock(
      { type: 'atomic', key: endBlockKey, text: ' ', characterList: endCharList }));
  
  return content;
}

// Insert an array of blocks after a particular block referenced by blockKey
export function insertBlocksAfter(
  contentState: ContentState, blockKey: string, 
  blocks: ContentBlock[]) : ContentState {

  const blockMap = contentState.getBlockMap();
  const insertAfterBlock = blockMap.get(blockKey);

  const toInsert = blocks.map(b => [b.getKey(), b]);

  const blocksBefore = blockMap.toSeq().takeUntil(v => v === insertAfterBlock);
  const blocksAfter = blockMap.toSeq().skipUntil(v => v === insertAfterBlock).rest();
  const newBlocks = blocksBefore.concat(
    [[insertAfterBlock.getKey(), insertAfterBlock], ...toInsert],
    blocksAfter,
  ).toOrderedMap();

  return contentState.merge({
    blockMap: newBlocks,
  });
}
