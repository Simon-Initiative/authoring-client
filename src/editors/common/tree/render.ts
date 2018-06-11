import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  ChildrenAccessor, Handlers, HasGuid, NodeId, NodeRenderer, Nodes, RenderedNode,
} from './types';

// Given a collection of root nodes (nodes) and a way to navigate
// through their tree structure (getChildren) render only
// the visible nodes using a suppled renderer.
export function renderVisibleNodes<NodeType extends HasGuid>(
  nodes: Nodes<NodeType>,
  getChildren: ChildrenAccessor<NodeType>,
  renderer: NodeRenderer<NodeType>,
  expandedNodes: Immutable.Set<NodeId>,
  selectedNodes: Immutable.Set<NodeId>,
  handlers: Handlers) : RenderedNode<NodeType>[] {

  const rendered : RenderedNode<NodeType>[] = [];

  renderVisibleNodesHelper(
    nodes, getChildren, renderer, expandedNodes,
    selectedNodes, Maybe.nothing<NodeType>(), 0, handlers, rendered);

  return rendered;
}

// Exists to facilitate the recursion.
function renderVisibleNodesHelper<NodeType extends HasGuid>(
  nodes: Nodes<NodeType>,
  getChildren: ChildrenAccessor<NodeType>,
  renderer: NodeRenderer<NodeType>,
  expandedNodes: Immutable.Set<NodeId>,
  selectedNodes: Immutable.Set<NodeId>,
  parentNode: Maybe<NodeType>,
  depth: number,
  handlers: Handlers,
  rendered: RenderedNode<NodeType>[]) : void {

  nodes
    .map((n, nodeId) => [nodeId, n])
    .toArray()
    .forEach((entry, indexWithinParent) => {

      const nodeId = (entry[0] as string);
      const n = (entry[1] as NodeType);

      // Record metadata about this node
      const nodeState = {
        parentNode,
        indexWithinParent,
        isSelected: selectedNodes.has(nodeId),
        depth,
      };

      // Now render it
      const component = renderer(n, nodeState, handlers);
      rendered.push({ nodeId, node: n, parent: parentNode, depth, indexWithinParent, component });

      // If this node is expanded, recursively render it's children
      if (expandedNodes.has(nodeId)) {
        getChildren(n).lift(children =>
          renderVisibleNodesHelper(
            children, getChildren, renderer, expandedNodes,
            selectedNodes, Maybe.just(n), depth + 1, handlers, rendered));
      }

    });
}
