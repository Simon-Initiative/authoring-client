import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data//contentTypes';
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
  onSelect: (selectedNode: AssessmentNode) => void;
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

const canHandleDrop : Tree.CanDropHandler<AssessmentNode> = (
  nodeBeingDropped: AssessmentNode,
  originalParent: Maybe<AssessmentNode>,
  originalIndex: number,
  newParent: Maybe<AssessmentNode>,
  newIndex: number) : boolean => {



  // Regardless of the type of node, if it is a drop
  // attempt in the same parent we do not allow
  // dropping directly above or below the current node
  if (Tree.isSameNode(originalParent, newParent)) {

    if (newIndex < originalIndex) {
      if (originalIndex - newIndex < 1) {
        return false;
      }
    } else {
      if (newIndex - originalIndex <= 1) {
        return false;
      }
    }
  }

  if (nodeBeingDropped.contentType === 'Question') {

    // A question can be repositioned anywhere
    return true;

  } else if (nodeBeingDropped.contentType === 'Content') {

    // A content cannot be repositioned into a selection
    return newParent.caseOf({
      just: p => p.contentType !== 'Selection',
      nothing: () => true,
    });

  } else if (nodeBeingDropped.contentType === 'Selection') {

    // A selection cannot be repositioned into another selection
    return newParent.caseOf({
      just: p => p.contentType !== 'Selection',
      nothing: () => true,
    });

  } else if (nodeBeingDropped.contentType === 'Unsupported') {

    // Do not allow repositioning of unsupported elements to
    // another parent
    return Tree.isSameNode(originalParent, newParent);
  }

  return true;
};


export class Outline extends React.PureComponent<OutlineProps, {}> {

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(selected: string) {

    // Find the node
    if (this.props.nodes.has(selected)) {
      this.props.onSelect(this.props.nodes.get(selected));
    } else {

      // Find the node in the embedded pools
      const found = this.props.nodes
        .toArray()
        .reduce(
          (node, p) => {
            if (p.contentType === 'Selection') {
              if (p.source.contentType === 'Pool') {
                return node !== undefined
                  ? node
                  : p.source.questions.get(selected);
              }
            }
            return node;
          },
          undefined);

      this.props.onSelect(found);
    }


  }

  render() {

    const { nodes, expandedNodes, selected, editMode,
      onEdit, onChangeExpansion } = this.props;

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
        onSelect={this.onSelect}
        renderNodeComponent={renderTab}
        canHandleDrop={canHandleDrop}
        />
    );
  }

}
