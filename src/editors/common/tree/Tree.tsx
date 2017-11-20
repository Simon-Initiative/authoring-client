import * as React from 'react';
import * as Immutable from 'immutable';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DraggableNode } from './DraggableNode';
import { Maybe } from 'tsmonad';

import { buildRenderer as buildDivRenderer } from './types/div';

import { NodeId, Nodes, NodeState, TreeType,
  RenderedNode, NodeRenderer, Handlers,
  ChildrenAccessor, ChildrenMutator,
  TreeRenderer } from './types';

import { renderVisibleNodes } from './render';


export interface TreeProps<NodeType> {

  editMode: boolean;

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

  // The type of tree UI to render
  treeType: TreeType;

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
  extends React.PureComponent<TreeProps<NodeType>, {}> {

  constructor(props) {
    super(props);
  }

  render() {

    const { selected, treeType, nodes, editMode,
      expandedNodes, getChildren, renderNodeComponent } = this.props;

    const handlers : Handlers = {
      onSelect: nodeId => this.props.onSelect(nodeId),
      onCollapse: nodeId =>
        this.props.onChangeExpansion(this.props.expandedNodes.subtract([nodeId])),
      onExpand: nodeId =>
        this.props.onChangeExpansion(this.props.expandedNodes.add(nodeId)),
    };

    // Walk the nodes of the tree in-order, rendering each node, but being
    // careful to only render nodes that are visible (i.e. their parent is
    // is in an expanded state)
    const renderedNodes : RenderedNode<NodeType>[] = renderVisibleNodes(
      nodes, getChildren, renderNodeComponent, expandedNodes, Immutable.Set([selected]), handlers);

    const treeRenderer = buildDivRenderer();

    // Now simply render the tree structure, wrapping the tree and each rendered
    // node using the tree renderer
    return treeRenderer.renderTree(renderedNodes.map((r, i) =>
      treeRenderer.renderNode(
        r.nodeId, r.node,
        { depth: r.depth, parentNode: r.parent, isSelected: selected === r.nodeId },
        r.component, r.indexWithinParent, editMode)));
  }

}

