import * as React from 'react';
import * as Immutable from 'immutable';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Maybe } from 'tsmonad';

import { NodeId, Nodes, NodeState,
  RenderedNode, NodeRenderer,
  ChildrenAccessor, ChildrenMutator,
  TreeRenderer } from './types';

import { renderVisibleNodes } from './render';

const listGroupTreeRenderer : TreeRenderer = {

  renderTree: children =>
    <ul className="list-group">{children}</ul>,

  renderNode: (depth: number, isSelected: boolean, nodeComponent) =>
    <li className="list-group-item" style={ { marginLeft: (depth * 10) + 'px' } }>
      {nodeComponent}
    </li>,
};


export interface TreeState {

}

export interface TreeProps<NodeType> {

  // The current root nodes of the tree
  nodes: Nodes<NodeType>;

  // Accessor for the children of any node, return Nothing
  // if this node cannot have children, return an empty
  // Nodes map if it can have children but currently does not.
  getChildren: ChildrenAccessor<NodeType>;

  // Mutator to update the children of a node in the tree.
  setChildren: ChildrenMutator<NodeType>;

  // Which nodes in the tree are expanded, Nothing represents
  // the default state where the tree will apply its
  // initialExpansionStrategy to determine which nodes should
  // be expanded
  expandedNodes: Immutable.Set<NodeId>;

  // The identifier of the currently active, or selected node
  selected: NodeId;

  // Optional. How the tree should render itself and it's nodes. The
  // mechanism, if this property is left unset is to render the
  // tree as a bootstrap list-group with the nodes as indented
  // list items.  Via this property, clients have complete
  // control over how the tree renders - likely implementations
  // could be table based, or bootstrap grid based.
  treeRenderer?: TreeRenderer;

  // Function to execute to report that the tree data has been edited.
  // This likely includes removals and reorders.
  onEdit: (nodes: Nodes<NodeType>) => void;

  // Function to execute to report that the tree has changed
  // the node expansion state.
  onChangeExpansion: (expandedNodes: Immutable.Set<NodeId>) => void;

  // Function to execute to indicate that the selected - aka active -
  // node has changed.
  onSelect: (id: NodeId) => void;

  // Called by the tree when a need is to be rendered.
  renderNodeComponent: NodeRenderer<NodeType>;

  // Called by the tree when a potential drop is initiated.
  canHandleDrop: (
    sourceNode: NodeType,
    sourceIndex: number,
    sourceNodeState: NodeState<NodeType>,
    destNode: NodeType,
    destIndex: number,
    destNodeState: NodeState<NodeType>) => boolean;
}

/**
 * Reusable tree component.
 */
@DragDropContext(HTML5Backend)
export class Tree<NodeType>
  extends React.PureComponent<TreeProps<NodeType>, TreeState> {

  constructor(props) {
    super(props);
  }

  render() {

    const { selected, treeRenderer, nodes,
      expandedNodes, getChildren, renderNodeComponent } = this.props;

    // Use the list-group tree structure by default if no other one specified
    const actualTreeRenderer = treeRenderer === undefined
      ? listGroupTreeRenderer
      : treeRenderer;

    // Walk the nodes of the tree in-order, rendering each node, but being
    // careful to only render nodes that are visible (i.e. their parent is
    // is in an expanded state)
    const renderedNodes : RenderedNode[] = renderVisibleNodes(
      nodes, getChildren, renderNodeComponent, expandedNodes, Immutable.Set(selected));

    // Now simply render the tree structure, wrapping the tree and each rendered
    // node using the tree renderer
    return actualTreeRenderer.renderTree(
      renderedNodes.map(r =>
        actualTreeRenderer.renderNode(r.depth, r.nodeId === selected, r.component)),
    );
  }

}

