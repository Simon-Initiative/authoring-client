
import * as Immutable from 'immutable';
import * as ct from 'data/contentTypes';
import { OrganizationModel } from 'data/models/org';
import { Maybe } from 'tsmonad';
import { map, filter } from 'data/utils/map';
import { ContentElement } from 'data/content/common/interfaces';

type OrgNode =
  ct.Sequence | ct.Unit | ct.Module |
  ct.Section |
  ct.Item;

type AnonymousNode =
  ct.Precondition |
  ct.ProgressConstraint |
  ct.Supplement |
  ct.Before |
  ct.Dependency;

type OrgChangeRequest =
  UpdateNode |
  AddNode |
  RemoveNode |
  MoveNode |
  SetAnonymousAttribute |
  AddAnonymousNode |
  RemoveAnonymousNode;

// Change requests for strongly identifiable nodes in an
// org model. Strongly identifiable nodes are nodes that
// have a unique id (e.g. unit, module, section)

interface UpdateNode {
  type: 'UpdateNode';
  nodeId: string;
  mapper: (node: OrgNode) => OrgNode;
}

interface AddNode {
  type: 'AddNode';
  parentId: string;
  node: OrgNode;
  index: Maybe<number>;
}

interface RemoveNode {
  type: 'RemoveNode';
  nodeId: string;
}

interface MoveNode {
  type: 'MoveNode';
  node: OrgNode;
  destParentId: string;
  destIndex: number;
}

export function makeAddNode(parentId: string, node: OrgNode, index: Maybe<number>): AddNode {
  return {
    type: 'AddNode',
    parentId,
    node,
    index,
  };
}

export function makeRemoveNode(nodeId: string): RemoveNode {
  return {
    type: 'RemoveNode',
    nodeId,
  };
}

export function makeMoveNode(
  node: OrgNode,
  destParentId: string,
  destIndex: number): MoveNode {
  return {
    type: 'MoveNode',
    node,
    destParentId,
    destIndex,
  };
}

export function makeUpdateNode(
  nodeId: string,
  mapper: (node: OrgNode) => OrgNode): UpdateNode {
  return {
    type: 'UpdateNode',
    nodeId,
    mapper,
  };
}

// Change requests for 'anonymous' nodes.  These are objects
// in the org that do not have unique identifiers.  For instance,
// a 'dependency' in the 'dependencies' collection of a unit.
// We can attempt to identify these types of nodes by using the
// identity of the strongly identifiable parent node and the
// attribute name of the collection that the anonymous node
// is contained in.

interface SetAnonymousAttribute {
  type: 'SetAnonymousAttribute';
  parentId: string;
  previous: AnonymousNode;
  attributeName: string;
  value: any;
}


interface AddAnonymousNode {
  type: 'AddAnonymousNode';
  parentId: string;
  node: AnonymousNode;
}


interface RemoveAnonymousNode {
  type: 'RemoveAnonymousNode';
  parentId: string;
  node: AnonymousNode;
}



// Attempts to apply a change request to an organization model.
// If the change can successfully be applied just the new model
// is returned, otherwise nothing is returned.
export function applyChange(
  model: OrganizationModel, change: OrgChangeRequest): Maybe<OrganizationModel> {

  if (change.type === 'RemoveNode') {
    return removeNode(model, change);
  }
  if (change.type === 'AddNode') {
    return addNode(model, change);
  }
  if (change.type === 'MoveNode') {
    return moveNode(model, change);
  }
  if (change.type === 'UpdateNode') {
    return updateNode(model, change);
  }
  if (change.type === 'AddAnonymousNode') {

  }
  if (change.type === 'RemoveAnonymousNode') {

  }
  if (change.type === 'SetAnonymousAttribute') {

  }
}

// Remove a strongly identified node. This change request type
// is unique in that it really cannot fail - since if we cannot
// find the node to remove then it has already been removed.
function removeNode(model: OrganizationModel, change: RemoveNode): Maybe<OrganizationModel> {
  const predicate = (e) => {
    if ((e as any).id !== undefined) {
      return !((e as any).id === change.nodeId);
    }
    return true;
  };
  return Maybe.just(
    filter(predicate, (model as any) as ContentElement)) as Maybe<OrganizationModel>;
}

// Add a strongly identified node.  Fails if the parent node cannot
// be found, or if there is an index specified to add at that exceeds
// the current length of the children map.
function addNode(model: OrganizationModel, change: AddNode): Maybe<OrganizationModel> {

  // Assume that the operation will fail
  let succeeded = false;

  const add = (e) => {
    const c = e as any;

    // Locate the parent id.
    if (c.id !== undefined && c.id === change.parentId) {

      // We found the parent node, so we now know that this operation
      // will succeed
      succeeded = true;

      // How we add it based on whether an index was specified or not
      const children = c.children;
      return change.index.caseOf({
        just: (index) => {
          // If the index exceeds or equals the size we just
          // add the node to the end
          if (index >= children.size) {
            return c.with({ children: children.set(change.node.guid, change.node) });
          }
          // Otherwise we handle inserting the node into the
          // requested index, which requires tearing down the
          // ordered map and rebuilding it.
          const arr = children.toArray();
          arr.splice(index, 0, change.node);
          const updated = Immutable.OrderedMap<string, any>(arr.map(a => [a.guid, a]));
          return c.with({ children: updated });
        },
        nothing: () => {
          // Just add it to the end of the collection
          return c.with({ children: children.set(change.node.guid, change.node) });
        },
      });
    }
    return e;
  };

  const updated = (map(add, (model as any) as ContentElement) as any) as OrganizationModel;
  return succeeded ? Maybe.just(updated) : Maybe.nothing();
}


// Allows updating of a strongly identifiable node. Can fail if
// the node cannot be found.
function updateNode(model: OrganizationModel, change: UpdateNode): Maybe<OrganizationModel> {

  // Assume that the operation will fail
  let succeeded = false;

  const wrappedMapper = (e) => {
    const c = e as any;
    if (c.id !== undefined && c.id === change.nodeId) {
      succeeded = true;
      return change.mapper(e);
    }
    return e;
  };

  const updated
    = (map(wrappedMapper, (model as any) as ContentElement) as any) as OrganizationModel;
  return succeeded ? Maybe.just(updated) : Maybe.nothing();
}


// Moves a node, which is essentially an atomic remove and add. Fails
// if either the remove and add cannot be performed.
function moveNode(model: OrganizationModel, change: MoveNode): Maybe<OrganizationModel> {
  return removeNode(model, makeRemoveNode(change.node.id)).caseOf({
    just: m => addNode(
      m, makeAddNode(change.destParentId, change.node, Maybe.just(change.destIndex))),
    nothing: () => Maybe.nothing(),
  }) as Maybe<OrganizationModel>;
}

