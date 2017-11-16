import * as Immutable from 'immutable';

import { NodeId, NodeState, Nodes,
  ChildrenAccessor, ChildrenMutator,
  InitialExpansionStrategy, TreeRenderer } from './types';


// Tree data manipulation routines.

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
    nodes
      .map(node => getChildren(node).caseOf({
        just: nodes =>
          setChildren(node, removeNode(idToRemove, nodes, getChildren, setChildren)),
        nothing: () => node,
      }))
      .toOrderedMap();
  }
}


function insert<NodeType>(
  nodes: Nodes<NodeType>, childId: NodeId, childToAdd: NodeType, index: number) : Nodes<NodeType> {

  const arr = nodes
    .map((k, v) => [k, v])
    .toArray();

  arr.splice(index, 0, [childId, childToAdd]);

  return Immutable.OrderedMap<NodeId, NodeType>(arr);
}

export function insertNode<NodeType>(
  targetParentId: NodeId,
  childId: NodeId,
  childToAdd: NodeType,
  index: number,
  nodes: Nodes<NodeType>,
  getChildren: ChildrenAccessor<NodeType>,
  setChildren: ChildrenMutator<NodeType>) : Nodes<NodeType> {

  if (nodes.has(targetParentId)) {

    const parent = nodes.get(targetParentId);
    const updatedParent = getChildren(parent).caseOf({
      just: nodes => setChildren(parent, insert(nodes, childId, childToAdd, index)),
      nothing: () => parent,
    });

    return nodes.set(targetParentId, updatedParent);

  } else {
    nodes
    .map(node => getChildren(node).caseOf({
      just: nodes =>
        setChildren(node, insertNode(
          targetParentId, childId, childToAdd, index, nodes, getChildren, setChildren)),
      nothing: () => node,
    }))
    .toOrderedMap();
  }

}


export function updateNode(
  model: models.OrganizationModel,
  childToUpdate: any) : models.OrganizationModel {

  // If the child is a top level sequence just handle it
  // explicitly
  if (model.sequences.children.has(childToUpdate.guid)) {
    return model.with({ sequences: model.sequences.with(
      { children: model.sequences.children.set(childToUpdate.guid, childToUpdate) })});
  }

  return model.with({ sequences: model.sequences.with(
    { children: (model.sequences.children.map(
      updateChild.bind(undefined, childToUpdate)).toOrderedMap() as any),
    }) });
}


function updateChild(
  child: any,
  parentNode: any) {

  if (parentNode.children !== undefined && parentNode.children.get(child.guid) !== undefined) {
    return parentNode.with({ children: parentNode.children.set(child.guid, child) });

  } else {

    // Recurse if the current node has children
    return parentNode.children !== undefined && parentNode.children.size > 0
      ? parentNode.with(
        { children: parentNode.children.map(
          updateChild.bind(undefined, child)).toOrderedMap() })
      : parentNode;
  }
}

