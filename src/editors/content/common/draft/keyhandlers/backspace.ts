import { EditorState, Modifier, ContentState, SelectionState, ContentBlock } from 'draft-js';
import * as Immutable from 'immutable';
import * as common from '../../../../../data/content/html/common';

export default function handle(
  editorState: EditorState, onChange: (e: EditorState) => void) : string {
  
  const ss = editorState.getSelection();
  const start = ss.getStartOffset();

  // Handle backspacing at the beginning of a block to 
  // account for removing sentinel blocks
  if (start === 0) {
    return handleBackspaceAtBeginning(editorState, onChange);
  } 

  // Handle backspacing to delete an immutable entity
  const entityBefore = getEntityBefore(start, editorState);
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
    anchorOffset: start,
    focusKey: key,
    focusOffset: start + 1,
    isBackwards: false,
    hasFocus: false,
  });

  const updatedContent = Modifier.removeRange(
    editorState.getCurrentContent(),
    rangeToRemove,
    'forward',
  );

  const newSelection = new SelectionState({
    anchorKey: key,
    anchorOffset: start - 1,
    focusKey: key,
    focusOffset: start - 1,
    isBackwards: false,
    hasFocus: false,
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

  const key = currentContentBlock.getEntityAt(position);

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
    const blockKey = blockBefore.key;
    const entity = currentContent.getEntity(key);

    const data : common.BlockData = entity.getData();

    let oppositeSentinel;
    let direction;
    let start;
    let end;

    if (entity.type.endsWith('_begin')) {
      oppositeSentinel = entity.type.substr(0, entity.type.indexOf('_') + 1) + 'end';
      direction = 1;
      start = 0;
      end = currentContent.getBlocksAsArray().length;

    } else if (entity.type.endsWith('_end')) {
      oppositeSentinel = entity.type.substr(0, entity.type.indexOf('_') + 1) + 'begin';
      direction = -1;
      start = currentContent.getBlocksAsArray().length - 1;
      end = -1;

    } else {
      return 'not-handled';
    }
  
    // Go ahead and remove the two sentinel blocks and all blocks in between
    const arr = currentContent.getBlocksAsArray();
    let newArr = [];
    let inside = false;
    for (let i = start; i !== end; i += direction) {
      const block = arr[i];

      if (!inside) {
        if (block.key === blockKey && !inside) {
          inside = true;
        } else {
          newArr.push(block);
        }
      } else {
        if (block.type === 'atomic') {
          const type = currentContent.getEntity(block.getEntityAt(0)).data.type;
          if (type === oppositeSentinel) {
            inside = false;
          }
        }
      }
    }

    if (direction === -1) {
      newArr = newArr.reverse();
    }



    const updatedContent = currentContent.merge({
      blockMap: Immutable.OrderedMap<string, ContentBlock>(newArr.map(b => [b.key, b])),
      selectionBefore: ss,
      selectionAfter: ss,
    });

    onChange(EditorState.push(editorState, updatedContent, 'remove-range'));
    
    return 'handled';
        
  }
  return 'not-handled';
}
