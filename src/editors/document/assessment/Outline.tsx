import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import * as Tree from 'editors/common/tree';
import { Node as AssessmentNode } from 'data/contentTypes';
import { renderTab } from './tabs';

export interface OutlineProps {
  nodes: Immutable.OrderedMap<string, AssessmentNode>;
  expandedNodes: Immutable.Set<string>;
  selected: string;
  onEdit: (nodes: Immutable.OrderedMap<string, AssessmentNode>) => void;
  onChangeExpansion: (expanded: Immutable.Set<string>) => void;
  onSelect: (selected: string) => void;
}

function getChildren(node: AssessmentNode)
  : Maybe<Immutable.OrderedMap<string, AssessmentNode>> {

  switch (node.contentType) {
    case 'Selection':
      if (node.source.contentType === 'Pool') {
        return Maybe.just(node.source.questions);
      } else {
        return Maybe.nothing<AssessmentNode>();
      }
    default:
      return Maybe.nothing<AssessmentNode>();
  }
}

function setChildren(node: AssessmentNode, children) : AssessmentNode {
  switch (node.contentType) {
    case 'Selection':
      if (node.source.contentType === 'Pool') {
        return node.with({ source: node.source.with({ questions: children }) });
      } else {
        return node;
      }
    default:
      return node;
  }
}

const treeRenderer = (children) : JSX.Element => {
  return (
    <div className="list-group">
      {children}
    </div>
  );
};

const canHandleDrop = (
  sourceNode: AssessmentNode,
  sourceIndex: number,
  sourceNodeState: Tree.NodeState<AssessmentNode>,
  destNode: AssessmentNode,
  destIndex: number,
  destNodeState: Tree.NodeState<AssessmentNode>) : boolean => {

  return false;
};


export class Outline extends React.PureComponent<OutlineProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {

    const { nodes, expandedNodes, selected,
      onEdit, onChangeExpansion, onSelect } = this.props;

    return (
      <Tree.Component
        nodes={nodes}
        getChildren={getChildren}
        setChildren={setChildren}
        expandedNodes={expandedNodes}
        selected={selected}
        onEdit={onEdit}
        onChangeExpansion={onChangeExpansion}
        onSelect={onSelect}
        renderNodeComponent={renderTab}
        canHandleDrop={canHandleDrop}
        treeRenderer={treeRenderer}
        />
    );
  }

}
