import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';

export enum TreeType {
  DIV,
  TABLE,
}

export type RenderedNode<NodeType> = {
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

export type OnDropHandler =
  (sourceModel: any, sourceParentGuid: string, targetGuid: string, index: number) => void;

export type CanDropHandler = (
  id: string, nodeBeingDropped, originalParent,
  originalIndex: number, newParent, newIndex: number) => boolean;

export type NodeRenderer<NodeType>
  = (node: NodeType,
     nodeState: NodeState<NodeType>,
     handlers: Handlers) => JSX.Element;

// What we use to uniquely identify a tree node.
export type NodeId = string;

// The data for a tree.
export type Nodes<NodeType> = Immutable.OrderedMap<NodeId, NodeType>;

export type ChildrenAccessor<NodeType>
  = (node: NodeType) => Maybe<Nodes<NodeType>>;

export type ChildrenMutator<NodeType>
  = (node: NodeType, children: Nodes<NodeType>) => NodeType;

// Metadata regarding a node
export type NodeState<NodeType> = {
  depth: number,
  isSelected: boolean,
  parentNode: Maybe<NodeType>,
};



export type TreeRenderer<NodeType> = {

  renderTree: (children) => JSX.Element,

  renderNode: (
    nodeId: NodeId, node: NodeType, nodeState: NodeState<NodeType>,
    renderedNode: any, indexWithinParent: number, editMode: boolean) => JSX.Element,

  renderDropTarget: (
    index: number,
    onDrop: OnDropHandler,
    canAcceptId: CanDropHandler,
    parentModel: string,
    ) => JSX.Element,
};
