import * as React from 'react';
import * as Immutable from 'immutable';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Maybe } from 'tsmonad';
import { removeNode, insertNode, isSameNode } from './utils';

import { buildRenderer as buildDivRenderer } from './types/div';

import * as Types from './types';

import { renderVisibleNodes } from './render';


export interface TreeProps<NodeType extends Types.HasGuid> {

  editMode: boolean;

  // The current root nodes of the tree
  nodes: Types.Nodes<NodeType>;

  // Accessor for the children of any node, return Nothing
  // if this node cannot have children, return an empty
  // Nodes map if it can have children but currently does not.
  getChildren: Types.ChildrenAccessor<NodeType>;

  // Mutator to update the children of a node in the tree.
  setChildren: Types.ChildrenMutator<NodeType>;

  // Which nodes in the tree are expanded, Nothing represents
  // the default state where the tree will apply its
  // initialExpansionStrategy to determine which nodes should
  // be expanded
  expandedNodes: Immutable.Set<Types.NodeId>;

  // The identifier of the currently active, or selected node
  selected: Types.NodeId;

  // The type of tree UI to render
  treeType: Types.TreeType;

  // Function to execute to report that the tree data has been edited.
  // This likely includes removals and reorders.
  onEdit: (nodes: Types.Nodes<NodeType>) => void;

  // Function to execute to report that the tree has changed
  // the node expansion state.
  onChangeExpansion: (expandedNodes: Immutable.Set<Types.NodeId>) => void;

  // Function to execute to indicate that the selected - aka active -
  // node has changed.
  onSelect: (id: Types.NodeId) => void;

  // Called by the tree when a need is to be rendered.
  renderNodeComponent: Types.NodeRenderer<NodeType>;

  // Called by the tree when a potential drop is initiated.
  canHandleDrop: Types.CanDropHandler<NodeType>;
}

/**
 * Reusable tree component.
 */
@DragDropContext(HTML5Backend)
export class Tree<NodeType extends Types.HasGuid>
  extends React.PureComponent<TreeProps<NodeType>, {}> {

  constructor(props) {
    super(props);

    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(
    sourceModel: NodeType,
    sourceParent: Maybe<NodeType>,
    targetParent: Maybe<NodeType>,
    originalIndex: number,
    newIndex: number) {

    const { nodes, getChildren, setChildren, onEdit } = this.props;
    const id = sourceModel.guid;

    // removeNode |> insertNode |> onEdit

    const removedNodes = removeNode(id, nodes, getChildren, setChildren);

    // Handle the case where the drag is from and to the same parent
    // and the drag is a lowering of the source further down the parent -
    // We have to adjust the index otherwise we will place it at the wrong
    // spot after we remove it
    const adjustedIndex = isSameNode<NodeType>(sourceParent, targetParent)
      ? originalIndex < newIndex
        ? newIndex - 1
        : newIndex
      : newIndex;

    const insertedNodes = insertNode(
      targetParent.map(p => p.guid),
      id, sourceModel, adjustedIndex, removedNodes, getChildren, setChildren);

    onEdit(insertedNodes);

  }

  render() {

    const { selected, treeType, nodes, editMode, canHandleDrop,
      expandedNodes, getChildren, renderNodeComponent } = this.props;

    const handlers : Types.Handlers = {
      onSelect: nodeId => this.props.onSelect(nodeId),
      onCollapse: nodeId =>
        this.props.onChangeExpansion(this.props.expandedNodes.subtract([nodeId])),
      onExpand: nodeId =>
        this.props.onChangeExpansion(this.props.expandedNodes.add(nodeId)),
    };

    // Walk the nodes of the tree in-order, rendering each node, but being
    // careful to only render nodes that are visible (i.e. their parent is
    // is in an expanded state)
    const renderedNodes : Types.RenderedNode<NodeType>[] = renderVisibleNodes(
      nodes, getChildren, renderNodeComponent, expandedNodes, Immutable.Set([selected]), handlers);

    // Hardcoded for now to use the div-based tree renderer.
    const treeRenderer = buildDivRenderer();

    // Now simply render the tree structure, wrapping the tree and each rendered
    // node using the tree renderer.  We interleave the drop targets between
    // the rendered nodes, as well.
    const treeNodes = renderedNodes
      .map((r) => {
        const parentId = r.parent.caseOf({
          just: m => Maybe.just(m.guid),
          nothing: () => Maybe.nothing<string>(),
        });

        const target = treeRenderer.renderDropTarget(
          r.indexWithinParent, this.onDrop, canHandleDrop, r.parent, parentId, false, editMode);

        return treeRenderer.renderNode(
            r.nodeId, r.node,
            { depth: r.depth, parentNode: r.parent, isSelected: selected === r.nodeId },
            r.component, target, r.indexWithinParent, editMode);

      });

    return treeRenderer.renderTree(treeNodes);
  }

}

