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
