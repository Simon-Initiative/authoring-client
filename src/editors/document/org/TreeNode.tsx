import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import * as models from '../../../data/models';
import { NodeTypes } from './traversal';
import * as org from 'data/models/utils/org';

import './TreeNode.scss';
import { getNameAndIconByType } from 'components/ResourceView';

export interface TreeNodeProps {
  isSelected: boolean;
  numberAtLevel: number;      // 1-based position of this node at this level of the tree
  highlighted: boolean;       // Whether the node is highlighted or not
  labels: contentTypes.Labels; // Current state of custom labels
  model: NodeTypes;           // Model for this node
  parentModel: any;           // The parent model
  indexWithinParent: number;  // index position of this node within parent's children
  depth: number;              // Current depth within tree
  isExpanded: boolean;        // Is node expanded or not
  context: AppContext;
  org: models.OrganizationModel;
  onEdit: (request: org.OrgChangeRequest) => void;
  editMode: boolean;
  onClick: (model: NodeTypes) => void;
  onReposition: (
    sourceNode: Object, sourceParentGuid: string, targetModel: any, index: number) => void;
}

export interface TreeNodeState {

}


export class TreeNode
  extends React.PureComponent<TreeNodeProps, TreeNodeState> {

  constructor(props) {
    super(props);
  }

  getLabel(contentType: string) {

    if (contentType === 'Item') {
      return 'Resource';
    }

    return this.props.labels[contentType.toLowerCase()];
  }

  getAdaptiveNumber() {
    if (this.props.parentModel.contentType !== contentTypes.OrganizationContentTypes.Section) {
      return this.props.numberAtLevel;
    }

    return '';
  }

  getResourceIcon(resource: contentTypes.Resource) {
    return getNameAndIconByType(resource.type).icon;
  }

  renderTitle() {

    const { isExpanded, model, context } = this.props;

    if (model.contentType === contentTypes.OrganizationContentTypes.Item) {

      const resource = context.courseModel.resourcesById.get(
        model.resourceref.idref.value());
      return resource !== undefined
        ? <React.Fragment>
          <span style={{ marginRight: 8 }}>{this.getResourceIcon(resource)}</span>{resource.title}
        </React.Fragment>
        : 'Loading...';
    }
    if (model.contentType === contentTypes.OrganizationContentTypes.Include) {
      return 'Include';
    }

    const hasHiddenChildren = <i className="toggle fa fa-caret-right"></i>;
    const hasShownChildren = <i className="toggle fa fa-caret-down"></i>;

    const toggle = isExpanded ? hasShownChildren : hasHiddenChildren;
    const contentType = this.getLabel(model.contentType);
    const number = this.getAdaptiveNumber();

    return (
      <React.Fragment>
        {toggle}{contentType} {number}: {model.title}
      </React.Fragment>
    );
  }

  render(): JSX.Element {

    const { highlighted, isSelected, depth, model } = this.props;
    return (
      <tr
        className={`${highlighted ? 'table-info' : ''}`}
        key={model.guid}>
        <td onClick={() => this.props.onClick(model)}>
          <div className={`treenode-content ${isSelected ? 'selected' : ''}`}>
            <div className="treenode-title" style={{ marginLeft: (depth * 20) }}>
              {this.renderTitle()}
            </div>
          </div>
        </td>
      </tr >
    );
  }

}

