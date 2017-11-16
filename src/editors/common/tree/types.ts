import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';

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

// A type that clients can implement to pass in to the
// tree a custom way to render the tree.
export type TreeRenderer = {

  // Renders the base components of the tree.  In a table-based
  // renderer, for instance, this would be something like:
  //
  // <table><tbody>{children}</tbody></table>
  //
  renderTree: (children) => JSX.Element,

  // Renders the wrapper around the already rendered tree node
  // In a table-based renderer, this would be the row:
  //
  // <tr><td>{renderedNode}</td></tr>
  //
  // Either this function, or the node renderer itself can
  // take care of indentation based on the current depth.
  renderNode: (depth: number, isSelected: boolean, renderedNode) => JSX.Element,
};

// The method used to set the initial expansion state,
// in the case that the expandedNodes property is
// Nothing
export enum InitialExpansionStrategy {
  All,
  None,
  FirstLevel,
}
