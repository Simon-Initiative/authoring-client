import { EditorState, Modifier, ContentState, SelectionState, ContentBlock } from 'draft-js';

import * as common from '../../../../../data/content/html/common';

export default function handle(editorState: EditorState, onChange: (e: EditorState) => void) : string {
  
  const ss = editorState.getSelection();
  const start = ss.getStartOffset();

  // Handle backspacing at the beginning of a block to 
  // account for removing sentinel blocks
  if (start === 0) {
    return handleBackspaceAtBeginning(editorState, onChange);
  } 

  // Handle backspacing to delete an immutable entity
  const entityBefore = getEntityBefore(start - 1, editorState);
  if (entityBefore !== null) {
    return handleBackspaceAtEntity(editorState, onChange);
  }
  
  return 'not-handled';
  
}

function handleBackspaceAtEntity(editorState: EditorState, onChange: (e: EditorState) => void) {

  const currentContent = editorState.getCurrentContent();
  const ss = editorState.getSelection();
  const start = ss.getStartOffset();
  const currentContentBlock = currentContent.getBlockForKey(ss.getAnchorKey());

  const key = currentContentBlock.getKey();
  const rangeToRemove = new SelectionState({
    anchorKey: key,
    anchorOffset: start - 2,
    focusKey: key,
    focusOffset: start - 1,
    isBackwards: false,
    hasFocus: false
  });

  console.log('range to remove');
  console.log(rangeToRemove);

  const updatedContent = Modifier.removeRange(
    editorState.getCurrentContent(),
    rangeToRemove,
    'forward'
  );

  const newSelection = new SelectionState({
    anchorKey: key,
    anchorOffset: start - 2,
    focusKey: key,
    focusOffset: start - 2,
    isBackwards: false,
    hasFocus: false
  });

  onChange(
    EditorState.forceSelection(
      EditorState.push(editorState, updatedContent, 'backspace-character'), newSelection));
  
  return 'handled';

}

function getEntityBefore(position: number, editorState: EditorState) {

  const anchorKey = editorState.getSelection().getAnchorKey();
  const currentContent = editorState.getCurrentContent();
  const currentContentBlock = currentContent.getBlockForKey(anchorKey);

  const key = currentContentBlock.getEntityAt(position - 1);

  if (key !== null) {
    const entity = currentContent.getEntity(key);
    if (entity.getMutability() === 'IMMUTABLE') {
      return entity;
    }
  }

  return null;
}

function handleBackspaceAtBeginning(editorState: EditorState, onChange: (e: EditorState) => void) {
    
  const ss = editorState.getSelection();
  const anchorKey = ss.getAnchorKey();
  const currentContent = editorState.getCurrentContent();
  const currentContentBlock = currentContent.getBlockForKey(anchorKey);
  const blockBefore = currentContent.getBlockBefore(currentContentBlock.getKey());
    
  if (blockBefore !== undefined && blockBefore !== null && blockBefore.getType() === 'atomic') {
    
    const key = blockBefore.getEntityAt(0);
    const entity = currentContent.getEntity(key);

    const data : common.BlockData = entity.getData();

    let startKey = null;

    switch (data.type) {
      case 'pullout_end': // Intentional fall through
      case 'section_end': // Intentional fall through
      case 'example_end': // Intentional fall through
        startKey = data.beginBlockKey;
        break;
      case 'pullout_begin': // Intentional fall through
      case 'section_begin': // Intentional fall through
      case 'example_begin': // Intentional fall through
        startKey = blockBefore.getKey();
        break;
      default:
        return 'not-handled';
    }

    // Go ahead and remove the two sentinel blocks:

    var blockMap = currentContent.getBlockMap();
    var newBlocks = blockMap
      .toSeq()
      .filter((block, k) => {
        if (block.getKey() === startKey) {
          return false;
        }
        if (block.getType() === 'atomic') {
          const key = block.getEntityAt(0);
          const entity = currentContent.getEntity(key);
          const thisBeginBlockKey = entity.getData().beginBlockKey;

          if (thisBeginBlockKey !== undefined && thisBeginBlockKey === startKey) {
            return false;
          }
        } else if (block.getData() !== undefined) {
          const data = block.getData();
          if (data.get('beginBlockKey') === startKey) {
            return false;
          }
        }
        
        return true;
      })

    const updatedContent = currentContent.merge({
      blockMap: newBlocks,
      selectionBefore: ss,
      selectionAfter: ss,
    });

    onChange(EditorState.push(editorState, updatedContent, 'backspace-character'));
    
    return 'handled';
        
  }
  return 'not-handled';
}