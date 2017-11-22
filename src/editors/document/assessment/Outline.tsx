import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import * as Tree from 'editors/common/tree';
import { Node as AssessmentNode } from 'data/contentTypes';
import { renderTab } from './tabs';

export interface OutlineProps {
  editMode: boolean;
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

const canHandleDrop : Tree.CanDropHandler = (
  id: string, nodeBeingDropped: any,
  originalParent: any, originalIndex: number,
  newParent: any, newIndex: number) : boolean => {

  return true;
};


export class Outline extends React.PureComponent<OutlineProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {

    const { nodes, expandedNodes, selected, editMode,
      onEdit, onChangeExpansion, onSelect } = this.props;

    return (
      <Tree.Component
        editMode={editMode}
        treeType={Tree.TreeType.DIV}
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
        />
    );
  }

}
