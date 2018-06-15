import { Maybe } from 'tsmonad';

import { HasGuid } from 'data/utils/tree';

// Determines whether two things that might be nodes
// are the same node.  In the context of our tree
// representation, Nothing - as a parent - is used to represent
// the fact that a node is a root node.
export function isSameNode<NodeType extends HasGuid>(
    a: Maybe<NodeType>,
    b: Maybe<NodeType>) {

  return a.caseOf({
    just: (aP) => {
      return b.caseOf({
        just: (bP) => {
          return aP.guid === bP.guid;
        },
        nothing: () => false,
      });
    },
    nothing: () => {
      return b.caseOf({
        just: (bP) => {
          return false;
        },
        nothing: () => true,
      });
    },
  });
}

