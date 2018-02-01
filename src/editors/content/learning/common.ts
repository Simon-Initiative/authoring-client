import * as Immutable from 'immutable';
import { CharacterMetadata, ContentBlock, ContentState, Entity } from 'draft-js';
import { insertBlocksAfter, shouldInsertBlock } from '../commands/common';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/html/common';

export function handleInsertion(props : any) {
  if (shouldInsertBlock(props.selection, props.contentState, props.block.key)) {
    props.blockProps.onInsertBlock(props.block.key);
  }
}

export function isPredicate(beginBlockType: string, block: ContentBlock) : boolean {
  if (block.type === 'atomic') {
    const entity = Entity.get(block.getEntityAt(0));
    if (entity.data.type === beginBlockType) {
      return true;
    }
  }
  return false;
}

export function findKeyOfLast(
  beginKey: string, stopTypes: string[], contentState: ContentState,
  ...endTypes): string {

  const arr = contentState.getBlocksAsArray();
  let inside = false;
  let key = beginKey;

  for (let i = 0; i < arr.length; i += 1) {
    const block = arr[i];
    if (!inside && block.key === beginKey) {
      inside = true;
    } else if (inside) {

      if (block.type === 'atomic') {

        const entity = contentState.getEntity(block.getEntityAt(0));
        
        if (stopTypes.indexOf(entity.data.type) !== -1) {
          return key;
        }
        
        if (endTypes.indexOf(entity.data.type) !== -1) {
          key = block.key;
        }
      }
      
    }
  }
  return key; 
}

export function within(
  beginKey: string, endBlockType: string, contentState: ContentState,
  predicate: (block: ContentBlock) => boolean) {

  const arr = contentState.getBlocksAsArray();
  let inside = false;
  for (let i = 0; i < arr.length; i += 1) {
    const block = arr[i];
    if (!inside && block.key === beginKey) {
      inside = true;
    } else if (inside) {

      if (block.type === 'atomic') {
        const entity = contentState.getEntity(block.getEntityAt(0));
        if (entity.data.type === endBlockType) {
          return false;
        }
      }
      if (predicate(block)) {
        return true;
      }
    }
  }
  return false;
}

export function insertNoSpace(
  key: string, contentState: ContentState, 
  beginType: EntityTypes, endType: EntityTypes,
  beginData: Object, endData: Object, includePad = true) : ContentState {

  const beginBlockKey = generateRandomKey();
  const contentKey = generateRandomKey();
  const endBlockKey = generateRandomKey();

  let content = contentState;

  content = content.createEntity(
    beginType, 
    'IMMUTABLE', beginData);
  const beginKey = content.getLastCreatedEntityKey();

  content = content.createEntity(
    endType, 
    'IMMUTABLE', endData);
  const endKey = content.getLastCreatedEntityKey();

  const beginCharList = Immutable.List().push(new CharacterMetadata({ entity: beginKey }));
  const emptyCharList = Immutable.List().push(new CharacterMetadata());
  const endCharList = Immutable.List().push(new CharacterMetadata({ entity: endKey }));

  const blocks = [
    new ContentBlock({ type: 'atomic', key: beginBlockKey, 
      text: ' ', characterList: beginCharList }),
    new ContentBlock({ type: 'atomic', key: endBlockKey, text: ' ', characterList: endCharList }),
    
  ];

  if (includePad) {
    blocks.push(new ContentBlock({ type: 'unstyled', 
      key: contentKey, text: ' ', characterList: emptyCharList }));
  }
  

  return insertBlocksAfter(content, key, blocks);

}

export function insert(
  key: string, contentState: ContentState, 
  beginType: EntityTypes, endType: EntityTypes,
  beginData: Object, endData: Object, includePad = true) : ContentState {

  const beginBlockKey = generateRandomKey();
  const contentKey = generateRandomKey();
  const endBlockKey = generateRandomKey();

  let content = contentState;

  content = content.createEntity(
    beginType, 
    'IMMUTABLE', beginData);
  const beginKey = content.getLastCreatedEntityKey();

  content = content.createEntity(
    endType, 
    'IMMUTABLE', endData);
  const endKey = content.getLastCreatedEntityKey();

  const beginCharList = Immutable.List().push(new CharacterMetadata({ entity: beginKey }));
  const emptyCharList = Immutable.List().push(new CharacterMetadata());
  const endCharList = Immutable.List().push(new CharacterMetadata({ entity: endKey }));

  const blocks = [
    new ContentBlock({ type: 'atomic', key: beginBlockKey, 
      text: ' ', characterList: beginCharList }),
    new ContentBlock({ type: 'unstyled', key: contentKey, 
      text: ' ', characterList: emptyCharList }),
    new ContentBlock({ type: 'atomic', key: endBlockKey, text: ' ', characterList: endCharList }),
    
  ];

  if (includePad) {
    blocks.push(new ContentBlock({ type: 'unstyled', 
      key: contentKey, text: ' ', characterList: emptyCharList }));
  }
  

  return insertBlocksAfter(content, key, blocks);

}
