import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';


export type RenderedNode = {
  nodeId: NodeId,
  depth: number,
  indexWithinParent: number;
  component: JSX.Element,
};

export type Handlers = {
  onSelect: (nodeId: NodeId) => void,
  onExpand: (nodeId: NodeId) => void,
  onCollapse: (nodeId: NodeId) => void,
};

export type NodeRenderer<NodeType>
  = (node: NodeType,
     nodeState: NodeState<NodeType>,
     handlers: Handlers,
     connectDragSource: any) => JSX.Element;

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

// Renders the base components of the tree.  In a table-based
// renderer, for instance, this would be something like:
//
// <table><tbody>{children}</tbody></table>
//
export type TreeRenderer = (children) => JSX.Element;

