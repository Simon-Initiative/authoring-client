import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import * as Tree from 'editors/common/tree';
import { renderTab } from './tabs';
import { CourseModel, OrganizationModel } from 'data/models';
import './Outline.scss';
import * as org from 'data/models/utils/org';

import { OutlineNode } from './types';

export interface EditDetails {
  sourceModel: OutlineNode;
  sourceParent: Maybe<OutlineNode>;
  targetParent: Maybe<OutlineNode>;
  originalIndex: number;
  newIndex: number;
}

export interface OutlineProps {
  editMode: boolean;
  parentNodeId: string;
  nodes: Immutable.OrderedMap<string, OutlineNode>;
  onEdit: (change: org.OrgChangeRequest) => void;
  onView: (componentOrResourceId: string) => void;
  commandProcessor: (model, command) => void;
  course: CourseModel;
  placements: org.Placements;
  org: OrganizationModel;
}

export class Outline extends React.PureComponent<OutlineProps, {}> {

  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit(
    nodes: Immutable.OrderedMap<string, OutlineNode>,
    editDetails: Tree.TreeEditDetails<OutlineNode>) {


    const { sourceModel, newIndex } = editDetails;

    // we cannot handle reordering Includes yet
    if (sourceModel.contentType !== 'Include') {
      const cr = org.makeMoveNode(
        sourceModel as any, this.props.parentNodeId, newIndex);
      this.props.onEdit(cr);
    }

  }

  render() {

    const { nodes, editMode, onEdit,
      course, children, onView, commandProcessor, placements, org } = this.props;

    return (
      <div className="org-outline-container">
        <Tree.Component
          editMode={editMode}
          treeType={Tree.TreeType.DIV}
          nodes={nodes}
          getChildren={getChildren}
          setChildren={setChildren}
          expandedNodes={Immutable.Set()}
          selected={''}
          onEdit={this.onEdit}
          onChangeExpansion={() => { }}
          onSelect={() => { }}
          renderNodeComponent={renderTab.bind(
            null, course, onView, onEdit,
            commandProcessor, placements, org, editMode)}
          canHandleDrop={canHandleDrop} />
        {children}
      </div>
    );
  }
}

export function getChildren(node: OutlineNode): Maybe<Immutable.OrderedMap<string, OutlineNode>> {
  return Maybe.nothing<OutlineNode>();
}

export function setChildren(
  node: OutlineNode, Outline: Immutable.OrderedMap<string, OutlineNode>): OutlineNode {
  return node;
}

const canHandleDrop: Tree.CanDropHandler<OutlineNode> = (
  nodeBeingDropped: OutlineNode,
  originalParent: Maybe<OutlineNode>,
  originalIndex: number,
  newParent: Maybe<OutlineNode>,
  newIndex: number): boolean => {

  // Do not allow dropping immediately above or below the
  // original node
  if (newIndex < originalIndex) {
    if (originalIndex - newIndex < 1) {
      return false;
    }
  } else if (newIndex - originalIndex <= 1) {
    return false;
  }
  return true;
};

