import * as Immutable from 'immutable';
import {
  Include, Item, Module, Section, Sequence, Sequences, Unit,
} from 'data/contentTypes';
import guid from 'utils/guid';

type OrgNode = Sequences | Sequence | Unit | Module | Section | Include | Item;

// Recursive (through dupeChildren) duplication of immutable org tree,
// careful to change all the guids and ids
export function dupeOrgNode(v: OrgNode): OrgNode {

  const id = guid();

  if (v.contentType === 'Item') {
    return v.with({ guid: id, id });
  }
  if (v.contentType === 'Sequences') {
    return v.with({ guid: id, children: dupeChildren(v.children) });
  }
  if (v.contentType === 'Sequence') {
    return v.with({ guid: id, id, children: dupeChildren(v.children) });
  }
  if (v.contentType === 'Unit') {
    return v.with({ guid: id, id, children: dupeChildren(v.children) });
  }
  if (v.contentType === 'Module') {
    return v.with({ guid: id, id, children: dupeChildren(v.children) });
  }
  if (v.contentType === 'Section') {
    return v.with({ guid: id, id, children: dupeChildren(v.children) });
  }
  if (v.contentType === 'Include') {
    return v.with({ guid: id });
  }

}

function dupeChildren(children: Immutable.OrderedMap<string, OrgNode>)
  : Immutable.OrderedMap<string, any> {

  return Immutable.OrderedMap<string, any>(
    children
      .toArray()
      .map(c => dupeOrgNode(c))
      .reduce((arr, c) => [...arr, [c.guid, c]], []),
  );

}
