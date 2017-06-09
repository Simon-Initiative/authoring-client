import { EditorState, Modifier, ContentState, 
  SelectionState, ContentBlock, Entity } from 'draft-js';
import * as Immutable from 'immutable';
import * as common from '../../../../../data/content/html/common';
import { validateSchema } from '../paste';
export default function handle(
  editorState: EditorState, onChange: (e: EditorState) => void) : string {
  
  const ss = editorState.getSelection();
  const start = ss.getStartOffset();

  // Handle backspacing when there is a selection. We
  // need to make sure that the removal of the fragment 
  // associated with the selection does not result in a document
  // with invalid schema.
  if (!ss.isCollapsed()) {
    const updated = Modifier.removeRange(
      editorState.getCurrentContent(), 
      ss, ss.getIsBackward() ? 'backward' : 'forward');
    if (!validateSchema(updated)) {
      return 'handled';
    } else {
      return 'not-handled';
    }
  }

  // Handle backspacing at the beginning of a block to 
  // account for removing sentinel blocks
  if (start === 0) {
    return handleBackspaceAtBeginning(editorState, onChange);
  } 

  // Handle backspacing to delete an immutable entity
  const entityBefore = getEntityBefore(start, editorState);
  if (entityBefore !== null) {
    return handleBackspaceAtEntity(entityBefore, editorState, onChange);
  }
  
  return 'not-handled';
}

function removeRange(
  contentState: ContentState, start: number, end: number, key: string) : ContentState {

  const rangeToRemove = new SelectionState({
    anchorKey: key,
    anchorOffset: start,
    focusKey: key,
    focusOffset: end,
    isBackwards: false,
    hasFocus: false,
  });

  return Modifier.removeRange(
    contentState,
    rangeToRemove,
    'forward',
  );
}

function handleBackspaceAtEntity(
  entity: Entity, 
  editorState: EditorState, onChange: (e: EditorState) => void) {

  const currentContent = editorState.getCurrentContent();
  const ss = editorState.getSelection();
  const start = ss.getStartOffset();
  const currentContentBlock = currentContent.getBlockForKey(ss.getAnchorKey());
  const key = currentContentBlock.getKey();

  let updatedContent;
  
  if (entity.type === common.EntityTypes.formula_begin) {
    // We must find and remove the corresponding end
    const endPosition = findPositionOfEntity(
      common.EntityTypes.formula_end,
      currentContentBlock,
      currentContent,
      start,
      1);
    if (endPosition !== -1) {
      updatedContent = removeRange(currentContent, start - 1, endPosition + 1, key);
    }
      
  } else if (entity.type === common.EntityTypes.formula_end) {
    // We must find and remove the corresponding begin
    const startPosition = findPositionOfEntity(
      common.EntityTypes.formula_begin,
      currentContentBlock,
      currentContent,
      start - 1,
      -1);
    if (startPosition !== -1) {
      updatedContent = removeRange(currentContent, startPosition, start, key);
    }
  } else {
    updatedContent = removeRange(currentContent, start, start + 1, key);
  }

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

function findPositionOfEntity(
  type: common.EntityTypes,
  contentBlock: ContentBlock, 
  contentState: ContentState,
  start: number, direction: number) : number {

  const end = direction === 1 ? contentBlock.text.length : -1;

  for (let i = start; i !== end; i += direction) {
    const key = contentBlock.getEntityAt(i);

    if (key !== null) {
      const entity = contentState.getEntity(key);
      if (entity.getType() === type) {
        return i;
      }
    }
  }

  return -1;
  
}

function getEntityBefore(position: number, editorState: EditorState) : Entity {

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
