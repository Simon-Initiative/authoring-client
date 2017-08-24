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

  const bottomTarget = indexWithinParent === parentModel.children.size - 1
    ? <RepositionTarget 
      key={key}
      index={indexWithinParent + 1} 
      parentModel={parentModel}
      canAcceptId={canHandleDrop}  
      onDrop={onReorderNode}/>
    : null;

  const outerStyle : any = { position: 'relative', height: '50px' };
  const node : any = { position: 'absolute', top: 0, bottom: 0, width: '100%' };
  const topDrop : any = { position: 'absolute', top: '0', bottom: '30' };
  const bottomDrop : any = { position: 'absolute', top: '30', bottom: '0' };

  return (
    <div style={outerStyle}>

      <div style={node}>
      <DraggableNode key={key} id={model.guid} editMode={editMode} 
        index={indexWithinParent} source={model} parentModel={parentModel}>
        {renderedNode}</DraggableNode>
      </div>

      <div style={topDrop}>
        <RepositionTarget 
          key={key}
          index={indexWithinParent} 
          parentModel={parentModel}
          canAcceptId={canHandleDrop}  
          onDrop={onReorderNode}/>
      </div>
      <div style={bottomDrop}>
        {bottomTarget}
      </div>
    </div>
  );
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
