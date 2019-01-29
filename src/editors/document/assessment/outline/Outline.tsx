import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import * as Tree from 'editors/common/tree';
import { Node } from 'data/contentTypes';
import { renderTab } from 'editors/document/assessment/outline/tabs';
import { findNodeByGuid } from 'editors/document/assessment/utils';
import { CourseModel } from 'data/models';
import { Question } from 'data/content/assessment/question';
import './Outline.scss';

export interface EditDetails {
  sourceModel: Node;
  sourceParent: Maybe<Node>;
  targetParent: Maybe<Node>;
  originalIndex: number;
  newIndex: number;
}

export interface OutlineProps {
  editMode: boolean;
  nodes: Immutable.OrderedMap<string, Node>;
  expandedNodes: Immutable.Set<string>;
  selected: string;
  onEdit: (nodes: Immutable.OrderedMap<string, Node>, editDetails: EditDetails) => void;
  onChangeExpansion: (expanded: Immutable.Set<string>) => void;
  onSelect: (selectedNode: Node) => void;
  course: CourseModel;
}

export class Outline extends React.PureComponent<OutlineProps, {}> {

  onSelect = (selected: string) => {
    findNodeByGuid(this.props.nodes, selected)
      .lift(n => this.props.onSelect(n));
  }

  render() {

    const { nodes, expandedNodes, selected, editMode,
      onEdit, onChangeExpansion, course, children } = this.props;

    return (
      <div className="outline-container">
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
          renderNodeComponent={renderTab.bind(null, course)}
          canHandleDrop={canHandleDrop} />
        {children}
      </div>
    );
  }
}

export function getChildren(node: Node): Maybe<Immutable.OrderedMap<string, Node>> {

  switch (node.contentType) {
    case 'Selection':
      // Selection pools are currently the only Node that supports children
      if (node.source.contentType === 'Pool') {
        return Maybe.just(node.source.questions);
      }

      return Maybe.nothing<Node>();
    default:
      return Maybe.nothing<Node>();
  }
}

export function setChildren(node: Node, children: Immutable.OrderedMap<string, Question>): Node {
  switch (node.contentType) {
    case 'Selection':
      if (node.source.contentType === 'Pool') {
        return node.with({ source: node.source.with({ questions: children }) });
      }

      return node;
    default:
      return node;
  }
}

const canHandleDrop: Tree.CanDropHandler<Node> = (
  nodeBeingDropped: Node,
  originalParent: Maybe<Node>,
  originalIndex: number,
  newParent: Maybe<Node>,
  newIndex: number): boolean => {

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

  if (nodeBeingDropped.contentType === 'Question' ||
    nodeBeingDropped.contentType === 'FeedbackMultipleChoice' ||
    nodeBeingDropped.contentType === 'FeedbackOpenResponse' ||
    nodeBeingDropped.contentType === 'Likert' ||
    nodeBeingDropped.contentType === 'LikertSeries') {

    // A question can be repositioned anywhere
    return true;

  }
  if (nodeBeingDropped.contentType === 'Content') {

    // A content cannot be repositioned into a selection
    return newParent.caseOf({
      just: p => p.contentType !== 'Selection',
      nothing: () => true,
    });

  }
  if (nodeBeingDropped.contentType === 'Selection') {

    // A selection cannot be repositioned into another selection
    return newParent.caseOf({
      just: p => p.contentType !== 'Selection',
      nothing: () => true,
    });

  }
  if (nodeBeingDropped.contentType === 'Unsupported') {

    // Do not allow repositioning of unsupported elements to
    // another parent
    return Tree.isSameNode(originalParent, newParent);
  }

  return true;
};

