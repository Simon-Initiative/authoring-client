import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { NodeId, NodeState, Nodes,
  ChildrenAccessor, ChildrenMutator,
  InitialExpansionStrategy, TreeRenderer } from 'editors/common/tree/types';

import { removeNode, updateNode, insertNode } from 'editors/common/tree/utils';

type TestNode = number;

// Helper function to build a Nodes<TestNode> map, mapping
// the string representation of a number to that number,
// starting at 'start' for the number given in 'count'
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
    return Maybe.just(children[n]);
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
