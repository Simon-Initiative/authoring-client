import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { NodeId, NodeState, Nodes,
  ChildrenAccessor, ChildrenMutator,
  TreeRenderer } from 'editors/common/tree/types';

import { removeNode, updateNode, insertNode } from 'editors/common/tree/utils';

type TestNode = number;

// Helper function to build a Nodes<TestNode> map, mapping
// the string representation of a number to that number,
// starting at 'start' for the number given in 'count' times.
const buildNodes = (start: number, count: number) => {
  const arr = [];
  let i = 0;
  while (i < count) {
    const value = start + i;
    arr.push([value + '', value]);
    i += 1;
  }
  return Immutable.OrderedMap<NodeId, TestNode>(arr);
};

it('top level remove', () => {

  const get : ChildrenAccessor<TestNode> = n => Maybe.nothing<Nodes<TestNode>>();
  const set : ChildrenMutator<TestNode> = (n, nodes) => n;

  const nodes : Nodes<TestNode> = buildNodes(1, 4);

  const removed = removeNode<TestNode>('2', nodes, get, set);

  expect(removed.has('2')).toBe(false);
  expect(removed.size).toBe(3);
  expect(nodes.has('2')).toBe(true);
  expect(nodes.size).toBe(4);

});

it('second-level remove', () => {

  const children = {
    1: buildNodes(10, 4),
    2: buildNodes(20, 4),
    3: buildNodes(30, 4),
    4: buildNodes(40, 4),
  };

  const get : ChildrenAccessor<TestNode> = (n) => {

    const c = children[n];
    return c === undefined ? Maybe.nothing<TestNode>() : Maybe.just(children[n]);
  };

  const set : ChildrenMutator<TestNode> = (n, nodes) => {
    children[n] = nodes;
    return n;
  };

  const nodes : Nodes<TestNode> = buildNodes(1, 4);

  const removed = removeNode<TestNode>('22', nodes, get, set);

  expect(removed.size).toBe(4);
  expect(nodes.size).toBe(4);
  expect(children[2].size).toBe(3);
  expect(children[2].has('22')).toBe(false);

});


it('top level insert', () => {

  const get : ChildrenAccessor<TestNode> = n => Maybe.nothing<Nodes<TestNode>>();
  const set : ChildrenMutator<TestNode> = (n, nodes) => n;

  const nodes : Nodes<TestNode> = buildNodes(1, 4);

  const child = 7;

  let added = insertNode<TestNode>(
    Maybe.nothing<NodeId>(), '7', child, 0, nodes, get, set);

  expect(added.has('7')).toBe(true);
  expect(added.size).toBe(5);
  expect(added.first()).toBe(7);
  expect(nodes.has('7')).toBe(false);
  expect(nodes.size).toBe(4);

  added = insertNode<TestNode>(
    Maybe.nothing<NodeId>(), '7', child, 1, nodes, get, set);
  expect(added.toArray()[1]).toBe(7);

  added = insertNode<TestNode>(
    Maybe.nothing<NodeId>(), '7', child, 4, nodes, get, set);
  expect(added.toArray()[4]).toBe(7);

});


it('recursive insert', () => {

  const children = {
    1: buildNodes(10, 4),
    10: buildNodes(20, 4),
    20: buildNodes(30, 4),
  };

  const get : ChildrenAccessor<TestNode> = (n) => {

    const c = children[n];
    return c === undefined ? Maybe.nothing<TestNode>() : Maybe.just(children[n]);
  };

  const set : ChildrenMutator<TestNode> = (n, nodes) => {
    children[n] = nodes;
    return n;
  };

  const nodes : Nodes<TestNode> = buildNodes(1, 4);

  const inserted = insertNode<TestNode>(
    Maybe.just('20'), '50', 50, 0, nodes, get, set);

  expect(inserted.size).toBe(4);
  expect(nodes.size).toBe(4);
  expect(children[20].size).toBe(5);
  expect(children[20].has('50')).toBe(true);

});


it('top level update', () => {

  const get : ChildrenAccessor<TestNode> = n => Maybe.nothing<Nodes<TestNode>>();
  const set : ChildrenMutator<TestNode> = (n, nodes) => n;

  const nodes : Nodes<TestNode> = buildNodes(1, 4);

  const updated = updateNode<TestNode>('2', 10, nodes, get, set);

  expect(updated.has('2')).toBe(true);
  expect(updated.get('2')).toBe(10);
  expect(nodes.has('2')).toBe(true);
  expect(nodes.get('2')).toBe(2);

});



it('recursive update', () => {

  const children = {
    1: buildNodes(10, 4),
    10: buildNodes(20, 4),
    20: buildNodes(30, 4),
  };

  const get : ChildrenAccessor<TestNode> = (n) => {

    const c = children[n];
    return c === undefined ? Maybe.nothing<TestNode>() : Maybe.just(children[n]);
  };

  const set : ChildrenMutator<TestNode> = (n, nodes) => {
    children[n] = nodes;
    return n;
  };

  const nodes : Nodes<TestNode> = buildNodes(1, 4);

  const inserted = updateNode<TestNode>(
    '31', 50, nodes, get, set);

  expect(inserted.size).toBe(4);
  expect(nodes.size).toBe(4);
  expect(children[20].get('31')).toBe(50);

});
