
import * as Immutable from 'immutable';
import * as ct from 'data/contentTypes';
import { OrganizationModel } from 'data/models/org';
import { Maybe } from 'tsmonad';
import { map } from 'data/utils/map';
import { ContentElement } from 'data/content/common/interfaces';


export type OrgNode =
  ct.Sequence |
  ct.Unit |
  ct.Module |
  ct.Section |
  ct.Include |
  ct.Item;

export type AnonymousNode =
  ct.Precondition |
  ct.ProgressConstraint |
  ct.Supplement |
  ct.Before |
  ct.Dependency;

export type OrgChangeRequest =
  UpdateRootModel |
  UpdateNode |
  AddNode |
  RemoveNode |
  MoveNode |
  SetAnonymousAttribute |
  AddAnonymousNode |
  RemoveAnonymousNode;

function isNumberedNodeType(node: any) {
  return (node.contentType === ct.OrganizationContentTypes.Unit
    || node.contentType === ct.OrganizationContentTypes.Module
    || node.contentType === ct.OrganizationContentTypes.Section
    || node.contentType === ct.OrganizationContentTypes.Sequence);
}


export type PlacementParams = {
  node: OrgNode,
  positionAtLevel: Maybe<number>,
  level: number,
  directAncestors: Immutable.Set<string>,
  parent: Maybe<Placement>,
};

const defaults = (params: Partial<PlacementParams> = {}) => ({
  node: null,
  positionAtLevel: Maybe.nothing(),
  level: 0,
  directAncestors: Immutable.Set<string>(),
  parent: Maybe.nothing(),
});

export type Placements = Immutable.OrderedMap<string, Placement>;

export class Placement extends Immutable.Record(defaults()) {

  node: OrgNode;
  positionAtLevel: Maybe<number>;
  level: number;
  directAncestors: Immutable.Set<string>;
  parent: Maybe<Placement>;

  constructor(params?: Partial<PlacementParams>) {
    super(defaults(params));
  }

  with(values: Partial<PlacementParams>) {
    return this.merge(values) as this;
  }

}


// Make one traversal through the organization model, building
// a flattened represetnation of the organization hierarchy, more
// suitable for optimal rendering and other tasks.
export function modelToPlacements(
  model: OrganizationModel): Placements {

  const positions = {};
  const positionAtLevels = {};
  const placements = [];
  const arr = model.sequences.children.toArray();

  arr.forEach((n) => {
    modelToPlacementsHelper(
      n, 0, positions, positionAtLevels, placements, Maybe.nothing());
  });

  return Immutable.OrderedMap<string, Placement>(
    placements.map(p => [p.node.id, p]));
}


function modelToPlacementsHelper(
  node: any, level: number,
  positions: Object, positionAtLevels: Object,
  placements: Placement[],
  parent: Maybe<Placement>): void {


  let positionAtLevel = Maybe.nothing<number>();

  if (isNumberedNodeType(node)) {
    if (positionAtLevels[level] === undefined) {
      positionAtLevels[level] = 1;
    } else {
      positionAtLevels[level] = positionAtLevels[level] + 1;
    }
    positionAtLevel = Maybe.just(positionAtLevels[level]);

    positions[node.guid] = positionAtLevels[level];
  }

  const placement = new Placement().with({
    node,
    level,
    positionAtLevel,
    parent,
    directAncestors: parent.caseOf({
      just: p => p.directAncestors.add(p.node.id),
      nothing: () => Immutable.Set<string>(),
    }),
  });
  placements.push(placement);

  if (node.children !== undefined) {

    node.children.toArray()
      .forEach(n => modelToPlacementsHelper(
        n, level + 1, positions, positionAtLevels,
        placements, Maybe.just(placement)));
  }
}




// Change requests for strongly identifiable nodes in an
// org model. Strongly identifiable nodes are nodes that
// have a unique id (e.g. unit, module, section)

export interface UpdateRootModel {
  type: 'UpdateRootModel';
  mapper: (model: OrganizationModel) => OrganizationModel;
  undo: (model: OrganizationModel) => OrganizationModel;
}


export interface UpdateNode {
  type: 'UpdateNode';
  nodeId: string;
  mapper: (node: OrgNode) => OrgNode;
  undo: (node: OrgNode) => OrgNode;
}

export interface AddNode {
  type: 'AddNode';
  parentId: string;
  node: OrgNode;
  index: Maybe<number>;
}

export interface RemoveNode {
  type: 'RemoveNode';
  nodeId: string;
}

export interface MoveNode {
  type: 'MoveNode';
  node: OrgNode;
  destParentId: string;
  destIndex: number;
}


export function makeUpdateRootModel(
  mapper: (OrganizationModel) => OrganizationModel,
  undo: (OrganizationModel) => OrganizationModel): UpdateRootModel {
  return {
    type: 'UpdateRootModel',
    mapper,
    undo,
  };
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
  mapper: (node: OrgNode) => OrgNode,
  undo: (node: OrgNode) => OrgNode): UpdateNode {
  return {
    type: 'UpdateNode',
    nodeId,
    mapper,
    undo,
  };
}

// Change requests for 'anonymous' nodes.  These are objects
// in the org that do not have unique identifiers.  For instance,
// a 'dependency' in the 'dependencies' collection of a unit.
// We can attempt to identify these types of nodes by using the
// identity of the strongly identifiable parent node and the
// attribute name of the collection that the anonymous node
// is contained in.

export interface SetAnonymousAttribute {
  type: 'SetAnonymousAttribute';
  parentId: string;
  previous: AnonymousNode;
  attributeName: string;
  value: any;
}


export interface AddAnonymousNode {
  type: 'AddAnonymousNode';
  parentId: string;
  node: AnonymousNode;
}


export interface RemoveAnonymousNode {
  type: 'RemoveAnonymousNode';
  parentId: string;
  node: AnonymousNode;
}

export type AppliedChange = {
  updatedModel: OrganizationModel;
  undo: OrgChangeRequest;
};

// Attempts to apply a change request to an organization model.
// If the change can successfully be applied just the new model
// is returned, otherwise nothing is returned.
export function applyChange(
  model: OrganizationModel, change: OrgChangeRequest): Maybe<AppliedChange> {

  if (change.type === 'UpdateRootModel') {
    return updateRootModel(model, change);
  }
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
  return Maybe.nothing();
}

// Remove a strongly identified node. This change request type
// is unique in that it really cannot fail - since if we cannot
// find the node to remove then it has already been removed.
function removeNode(model: OrganizationModel, change: RemoveNode): Maybe<AppliedChange> {

  const holder = {
    parentId: null,
    found: false,
    index: 0,
    node: null,
  };

  const updatedModel = model.with(
    { sequences: removeNodeHelper(model.sequences, change, holder) });

  if (holder.found) {
    return Maybe.just({
      updatedModel,
      undo: makeAddNode(holder.parentId, holder.node, Maybe.just(holder.index)),
    });
  }
  return Maybe.nothing();
}

function removeNodeHelper(e, change: RemoveNode, holder) {

  if (e.children === undefined) {
    return e;
  }
  // See if the node to remove is in this parent
  const arr = e.children.toArray();
  for (let i = 0; i < arr.length; i += 1) {
    const c = arr[i];
    if (c.id === change.nodeId) {
      holder.parentId = e.id;
      holder.found = true;
      holder.node = c;
      holder.index = i;
      return e.with({ children: e.children.delete(c.guid) });
    }
  }
  return e.with(
    { children: e.children.map(c => removeNodeHelper(c, change, holder)).toOrderedMap() });
}

// Add a strongly identified node.  Fails if the parent node cannot
// be found, or if there is an index specified to add at that exceeds
// the current length of the children map.
function addNode(model: OrganizationModel, change: AddNode): Maybe<AppliedChange> {

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

  if (succeeded) {
    const ac = {
      updatedModel: updated,
      undo: makeRemoveNode(change.node.id),
    };
    return Maybe.just(ac);
  }
  return Maybe.nothing();

}


// Allows updating of the root model. This cannot fail since we always have this model.
function updateRootModel(
  model: OrganizationModel, change: UpdateRootModel): Maybe<AppliedChange> {

  const undo = makeUpdateRootModel(change.undo, change.mapper);
  return Maybe.just({ updatedModel: change.mapper(model), undo });
}


// Allows updating of a strongly identifiable node. Can fail if
// the node cannot be found.
function updateNode(model: OrganizationModel, change: UpdateNode): Maybe<AppliedChange> {

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

  const updatedModel
    = (map(wrappedMapper, (model as any) as ContentElement) as any) as OrganizationModel;
  const undo = makeUpdateNode(change.nodeId, change.undo, change.mapper);

  return succeeded ? Maybe.just({ updatedModel, undo }) : Maybe.nothing();

}


// Moves a node, which is essentially an atomic remove and add. Fails
// if either the remove and add cannot be performed.
function moveNode(model: OrganizationModel, change: MoveNode): Maybe<AppliedChange> {

  return removeNode(model, makeRemoveNode(change.node.id)).caseOf({
    just: (ac) => {
      const theAdd = ac.undo as AddNode;
      const index = theAdd.index.valueOr(0);
      const add = addNode(
        ac.updatedModel,
        makeAddNode(change.destParentId, change.node, Maybe.just(change.destIndex)));

      return add.caseOf({
        just: (a) => {

          return Maybe.just({
            updatedModel: a.updatedModel,
            undo: makeMoveNode(change.node, theAdd.parentId, index),
          });

        },
        nothing: () => Maybe.nothing(),
      });

    },
    nothing: () => Maybe.nothing(),
  }) as Maybe<AppliedChange>;
}

