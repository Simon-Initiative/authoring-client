import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import { NodeId, NodeState, Nodes,
  ChildrenAccessor, ChildrenMutator,
  InitialExpansionStrategy, TreeRenderer } from './types';

// Recursive manipulation routines for our
// immutable tree representation

/**
 * Remove a node from the tree.
 * @param idToRemove the node to remove
 * @param nodes the current nodes
 * @param getChildren the accessor to get node children
 * @param setChildren the mutator to use to set node children
 */
export function removeNode<NodeType>(
  idToRemove: NodeId,
  nodes: Nodes<NodeType>,
  getChildren: ChildrenAccessor<NodeType>,
  setChildren: ChildrenMutator<NodeType>) : Nodes<NodeType> {

  // If the node to remove is in this set of children,
  // just simply remove it and we are done.
  if (nodes.has(idToRemove)) {
    return nodes.delete(idToRemove);
  } else {

    // Otherwise, we need to look at the children of
    // each of these nodes, recursively, and attempt to
    // remove the node deeper in the tree.
    return nodes
      .map(node => getChildren(node).caseOf({
        just: nodes =>
          setChildren(node, removeNode(idToRemove, nodes, getChildren, setChildren)),
        nothing: () => node,
      }))
      .toOrderedMap();
  }
}

// Helper insertion function.
function insert<NodeType>(
  nodes: Nodes<NodeType>, childId: NodeId, childToAdd: NodeType, index: number) : Nodes<NodeType> {

  const arr = nodes
    .map((k, v) => [k, v])
    .toArray();

  arr.splice(index, 0, [childId, childToAdd]);

  return Immutable.OrderedMap<NodeId, NodeType>(arr);
}

/**
 * Insert a node at any point in a tree.
 * @param targetParentId Just the parent node id, or nothing to insert at root
 * @param childId the id of the node to insert
 * @param childToAdd the node to insert
 * @param index the index position within the parent as to where to insert it
 * @param nodes the current nodes
 * @param getChildren the get accessor for node children
 * @param setChildren the mutator to set node children
 */
export function insertNode<NodeType>(
  targetParentId: Maybe<NodeId>,
  childId: NodeId,
  childToAdd: NodeType,
  index: number,
  nodes: Nodes<NodeType>,
  getChildren: ChildrenAccessor<NodeType>,
  setChildren: ChildrenMutator<NodeType>) : Nodes<NodeType> {

  return targetParentId.caseOf({
    just: (parentId) => {
      if (nodes.has(parentId)) {

        const parent = nodes.get(parentId);
        const updatedParent = getChildren(parent).caseOf({
          just: nodes => setChildren(parent, insert(nodes, childId, childToAdd, index)),
          nothing: () => parent,
        });

        return nodes.set(parentId, updatedParent);

      } else {

        return nodes
        .map(node => getChildren(node).caseOf({
          just: nodes =>
            setChildren(node, insertNode(
              targetParentId, childId, childToAdd, index, nodes, getChildren, setChildren)),
          nothing: () => node,
        }))
        .toOrderedMap();
      }
    },
    nothing: () => {
      return insert(nodes, childId, childToAdd, index);
    },
  });
}

/**
 * Update an existing node within the tree.
 * @param idToUpdate the id of the node to update
 * @param newNode the new state for the node
 * @param currentNodes the current nodes
 * @param getChildren the get accessor to access node children
 * @param setChildren the mutator used to set node children
 */
export function updateNode<NodeType>(
  idToUpdate: NodeId,
  newNode: NodeType,
  currentNodes: Nodes<NodeType>,
  getChildren: ChildrenAccessor<NodeType>,
  setChildren: ChildrenMutator<NodeType>) : Nodes<NodeType> {

  // If the node to update is in this set of children,
  // just simply update it and we are done.
  if (currentNodes.has(idToUpdate)) {
    console.log(idToUpdate + ' ' + newNode);
    return currentNodes.set(idToUpdate, newNode);
  } else {

    // Otherwise, we need to look at the children of
    // each of these nodes, recursively, and attempt to
    // update the node deeper in the tree.
    return currentNodes
      .map(node => getChildren(node).caseOf({
        just: nodes =>
          setChildren(node, updateNode(idToUpdate, newNode, nodes, getChildren, setChildren)),
        nothing: () => node,
      }))
      .toOrderedMap();
  }
}

