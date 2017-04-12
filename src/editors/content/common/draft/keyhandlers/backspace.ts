import { EditorState, ContentState, SelectionState, ContentBlock } from 'draft-js';

import * as common from '../translation/common';

export default function handle(editorState: EditorState, onChange: (e: EditorState) => void) : string {
  
  const ss = editorState.getSelection();
  const start = ss.getStartOffset();

  if (start === 0) {
    return handleBackspaceAtBeginning(editorState, onChange);
  } else {
    return 'not-handled';
  }
}

function handleBackspaceAtBeginning(editorState: EditorState, onChange: (e: EditorState) => void) {
    
  const ss = editorState.getSelection();
  const anchorKey = ss.getAnchorKey();
  const currentContent = editorState.getCurrentContent();
  const currentContentBlock = currentContent.getBlockForKey(anchorKey);
  const blockBefore = currentContent.getBlockBefore(currentContentBlock.getKey());
    
  if (blockBefore !== null && blockBefore.getType() === 'atomic') {
    
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

    onChange(EditorState.push(editorState, updatedContent, 'backspace'));
    
    return 'handled';
        
  }
  return 'not-handled';
}