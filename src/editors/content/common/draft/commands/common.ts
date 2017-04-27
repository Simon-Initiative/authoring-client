import { EditorState, AtomicBlockUtils, SelectionState, Modifier, ContentState, ContentBlock } from 'draft-js';
import { EntityTypes } from '../../../../../data/content/html/common';

// Append text to a content block
export function appendText(contentBlock, contentState, text) {

  const targetRange = new SelectionState({
    anchorKey: contentBlock.key,
    focusKey: contentBlock.key,
    anchorOffset: contentBlock.text.length,
    focusOffset: contentBlock.text.length
  })

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
    focusOffset: 1
  });
}

export function insertAtomicBlockWithEntity(editorState: EditorState, type: EntityTypes, data: Object) {

  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    type,
    'IMMUTABLE',
    data
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(
    editorState,
    {currentContent: contentStateWithEntity}
  );

  return AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      ' ');
}

// Insert an array of blocks after a particular block referenced by blockKey
export function insertBlocksAfter(contentState: ContentState, blockKey: string, 
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
    blockMap: newBlocks
  });
}
