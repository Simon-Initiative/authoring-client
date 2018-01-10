import * as Immutable from 'immutable';
import { ContentState, Modifier, SelectionState } from 'draft-js';
import guid from 'utils/guid';

export function updateData(contentBlock, contentState, blockData) {

  const targetRange = new SelectionState({
    anchorKey: contentBlock.key,
    focusKey: contentBlock.key,
    anchorOffset: 0,
    focusOffset: contentBlock.text.length,
  });

  return Modifier.setBlockData(
    contentState,
    targetRange,
    blockData);

}

function changeForBlock(contentState: ContentState, block) : ContentState {
  if (block.type === 'atomic') {

    // Extract the id from the entity data and change it
    const entityKey = block.getEntityAt(0);
    const entity = contentState.getEntity(entityKey);

    // If the data has an id, generate a new one to
    // avoid duplication
    const data = entity.data;

    const key = getFirstKey(data);

    if (key !== null) {
      const copy = {};

      if (data[key].clone !== undefined) {
        copy[key] = data[key].clone();
      } else if (data[key].id !== undefined) {
        copy[key] = data[key].with({ id: guid() });
      } else {
        copy[key] = data[key];
      }

      const updatedState = contentState.createEntity(
        entity.type, entity.mutability, copy);
      const createdKey = contentState.getLastCreatedEntityKey();
      const range = new SelectionState({
        anchorKey: block.key,
        focusKey: block.key,
        anchorOffset: 0,
        focusOffset: 1,
      });
      return Modifier.applyEntity(updatedState, range, createdKey);
    }
    return contentState;

  }

  // Extract the id from the data map and change it
  const id = block.data === undefined || block.data === null
    ? undefined
    : block.data.get('id');

  if (id !== undefined) {

    const blockData = Immutable.Map<string, string>()
      .set('id', guid());

    return updateData(block, contentState, blockData);

  }
  return contentState;

}

export function cloneContent(contentState: ContentState) : ContentState {
  return contentState.blockMap.toArray().reduce(changeForBlock, contentState);
}


function getFirstKey(o) {
  if (Object.keys(o).length > 0) {
    return Object.keys(o)[0];
  }
  return null;
}
