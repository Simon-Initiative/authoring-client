import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import { NodeId, NodeState, Nodes,
  RenderedNode, NodeRenderer,
  ChildrenAccessor, ChildrenMutator,
  TreeRenderer } from './types';

export function renderVisibleNodes<NodeType>(
  nodes: Nodes<NodeType>,
  getChildren: ChildrenAccessor<NodeType>,
  renderer: NodeRenderer<NodeType>,
  expandedNodes: Immutable.Set<NodeId>,
  selectedNodes: Immutable.Set<NodeId>) : RenderedNode[] {

  const rendered : RenderedNode[] = [];

  renderVisibleNodesHelper(
    nodes, getChildren, renderer, expandedNodes,
    selectedNodes, Maybe.nothing<NodeType>(), 0, rendered);

  return rendered;
}


export function renderVisibleNodesHelper<NodeType>(
  nodes: Nodes<NodeType>,
  getChildren: ChildrenAccessor<NodeType>,
  renderer: NodeRenderer<NodeType>,
  expandedNodes: Immutable.Set<NodeId>,
  selectedNodes: Immutable.Set<NodeId>,
  parentNode: Maybe<NodeType>,
  depth: number,
  rendered: RenderedNode[]) : void {

  nodes.map((n, nodeId) => {
    const nodeState = {
      parentNode,
      isSelected: selectedNodes.has(nodeId),
      depth,
    };
    const component = renderer(n, nodeState);
    rendered.push({ nodeId, depth, component });

    if (expandedNodes.has(nodeId)) {
      getChildren(n).lift(children =>
        renderVisibleNodesHelper(
          children, getChildren, renderer, expandedNodes,
          selectedNodes, Maybe.just(n), depth + 1, rendered));
    }

  });
}
