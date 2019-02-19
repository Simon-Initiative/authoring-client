import { Maybe } from 'tsmonad';

import { HasGuid, NodeId } from 'data/utils/tree';
export { ChildrenAccessor, ChildrenMutator, HasGuid, NodeId, Nodes } from 'data/utils/tree';

export enum TreeType {
  DIV,
  TABLE, // Not supported yet
}

export type RenderedNode<NodeType extends HasGuid> = {
  nodeId: NodeId,
  node: NodeType,
  parent: Maybe<NodeType>,
  depth: number,
  indexWithinParent: number;
  component: JSX.Element,
};

export type Handlers = {
  onSelect: (nodeId: NodeId) => void,
  onExpand: (nodeId: NodeId) => void,
  onCollapse: (nodeId: NodeId) => void,
};

// Callback to handle drops
export type OnDropHandler<NodeType extends HasGuid> = (
  nodeDropped: NodeType,
  nodeParent: Maybe<NodeType>,
  newParent: Maybe<NodeType>,
  originalIndex: number,
  newIndex: number) => void;

// Callback to test drops
export type CanDropHandler<NodeType extends HasGuid> = (
  nodeBeingDropped: NodeType,
  originalParent: Maybe<NodeType>,
  originalIndex: number,
  newParent: Maybe<NodeType>,
  newIndex: number) => boolean;

// A client supplied node renderer
export type NodeRenderer<NodeType extends HasGuid> = (
  node: NodeType,
  nodeState: NodeState<NodeType>,
  handlers: Handlers) => JSX.Element;



// Metadata regarding a node
export type NodeState<NodeType extends HasGuid> = {
  depth: number,
  indexWithinParent: number,
  isSelected: boolean,
  parentNode: Maybe<NodeType>,
};



export type TreeRenderer<NodeType extends HasGuid> = {

  renderTree: (children) => JSX.Element,

  renderNode: (
    nodeId: NodeId, node: NodeType, nodeState: NodeState<NodeType>,
    renderedNode: any, dropTarget: any,
    indexWithinParent: number, editMode: boolean) => JSX.Element,

  renderDropTarget: (
    index: number,
    onDrop: OnDropHandler<NodeType>,
    canAcceptId: CanDropHandler<NodeType>,
    parentModel: Maybe<NodeType>,
    parentModelId: Maybe<string>,
    isBottom: boolean,
    editMode: boolean,
  ) => JSX.Element,
};
