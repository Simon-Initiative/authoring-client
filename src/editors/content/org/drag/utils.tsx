import * as React from 'react';
import { RepositionTarget } from './RepositionTarget';
import { DraggableNode } from './DraggableNode';

import * as t from '../../../../data/contentTypes';

export type SourceNodeType = t.Sequence | t.Unit | t.Module | t.Section | t.Include | t.Item;

export type DestinationNodeType = t.Sequences | t.Sequence | t.Unit | t.Module | t.Section;

export function renderDraggableNodes(
  nodes: any, renderNode, canHandleDrop, onReorderNode, editMode, parentModel) {

  const elements = [];
  let index = 0;

  nodes.forEach((node) => {
    elements.push(renderDropTarget(index, parentModel, canHandleDrop, onReorderNode));
    elements.push(<DraggableNode id={node.guid} editMode={editMode} 
      index={index} source={node} parentModel={parentModel}>
      {renderNode(node)}</DraggableNode>);
    index += 1;
  });

  elements.push(renderDropTarget(nodes.size, parentModel, canHandleDrop, onReorderNode));

  return elements;
}

export type TypePredicate = (droppedType : SourceNodeType) => boolean;

export function canAcceptDrop(
  acceptsTypePredicate : TypePredicate, 
  sourceModel : SourceNodeType,
  destinationModel : DestinationNodeType, 
  sourceIndex : number,
  destinationIndex: number,
  sourceParentGuid: string) : boolean {

  const accepts = acceptsTypePredicate(sourceModel);

  if (accepts) {

    // Now check to see if we are repositioning within the same container
    if (sourceParentGuid === destinationModel.guid) {

      const delta = destinationIndex - sourceIndex;

      // We do not accept the drop if it isn't repositioning. In other words,
      // one cannot drag and drop an item in the drop slots directly above and below
      // the item 
      return delta !== 0 && delta !== 1;

    } else {
      return true;
    }

  } else {
    return false;
  }

}

function renderDropTarget(index: number, parentModel: any, canHandleDrop, onReorderNode) {
  return (
    <RepositionTarget 
      index={index} 
      parentModel={parentModel}
      canAcceptId={canHandleDrop}  
      onDrop={onReorderNode}/>
  );
}
