import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';


export enum TreeType {
  DIV,
  TABLE, // Not supported yet
}

export interface HasGuid {
  guid: string;
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
export type NodeRenderer<NodeType extends HasGuid>
  = (node: NodeType,
     nodeState: NodeState<NodeType>,
     handlers: Handlers) => JSX.Element;

// What we use to uniquely identify a tree node.
export type NodeId = string;

// The data for a tree.
export type Nodes<NodeType extends HasGuid> = Immutable.OrderedMap<NodeId, NodeType>;

// We abstract away navigating the tree and allow the client
// to implement this to control navigation
export type ChildrenAccessor<NodeType extends HasGuid>
  = (node: NodeType) => Maybe<Nodes<NodeType>>;

// Similar to accessor, we give control to the client as to
// how to mutate children in a tree.
export type ChildrenMutator<NodeType extends HasGuid>
  = (node: NodeType, children: Nodes<NodeType>) => NodeType;

// Metadata regarding a node
export type NodeState<NodeType extends HasGuid> = {
  depth: number,
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
