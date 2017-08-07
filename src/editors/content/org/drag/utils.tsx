import * as React from 'react';
import { RepositionTarget } from './RepositionTarget';

import * as t from '../../../../data/contentTypes';
import { DraggableNode } from './DraggableNode';

export type SourceNodeType = t.Sequence | t.Unit | t.Module | t.Section | t.Include | t.Item;

export type DestinationNodeType = t.Sequences | t.Sequence | t.Unit | t.Module | t.Section;


export function renderDraggableTreeNode(
  model: any, parentModel: any, renderedNode, canHandleDrop, 
  onReorderNode, editMode, indexWithinParent) {

  const elements = [];
  const key = parentModel.guid + '-draggable-' + model.guid;
  elements.push(renderDropTarget(
    indexWithinParent, parentModel, 
    canHandleDrop, onReorderNode, model.guid));
  elements.push(<DraggableNode key={key} id={model.guid} editMode={editMode} 
    index={indexWithinParent} source={model} parentModel={parentModel}>
    {renderedNode}</DraggableNode>);

  if (indexWithinParent === parentModel.children.size - 1) {
    elements.push(renderDropTarget(
    indexWithinParent + 1, parentModel, 
    canHandleDrop, onReorderNode, ''));
  }
   
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

  
  return accepts;
}

export function renderDropTarget(
  index: number, parentModel: any, canHandleDrop, onReorderNode, forItemGuid) {
  
  const key = parentModel.guid + '-' + forItemGuid;

  return (
    <RepositionTarget 
      key={key}
      index={index} 
      parentModel={parentModel}
      canAcceptId={canHandleDrop}  
      onDrop={onReorderNode}/>
  );
}
