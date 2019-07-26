import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import * as models from '../../../data/models';
import { NodeTypes } from './traversal';
import * as org from 'data/models/utils/org';
import { getNameAndIconByType } from 'components/ResourceView';

import './TreeNode.scss';

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
  onExpand: (id: string) => void;
  onReposition: (
    sourceNode: Object, sourceParentGuid: string, targetModel: any, index: number) => void;
}

export interface TreeNodeState {

}


export class TreeNode
  extends React.PureComponent<TreeNodeProps, TreeNodeState> {

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

    const { isExpanded, model, context, onExpand, isSelected } = this.props;

    if (model.contentType === contentTypes.OrganizationContentTypes.Item) {

      const resource = context.courseModel.resourcesById.get(model.resourceref.idref);

      return (
        <div>
          <div className={`treenode-item ${isSelected ? 'selected' : ''}`}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onClick(model);
            }}>
              {resource ? resource.title : 'Loading...'}
            </a>
          </div>
        </div>
      );
    }

    if (this.props.model.contentType === contentTypes.OrganizationContentTypes.Include) {
      return 'Include';
    }

    const toggle = <a href="#" className="toggle-link"
      onClick={(e) => {
        e.preventDefault();
        onExpand(model.id);
      }}>{isExpanded ? '[-]' : '[+]'}</a>;

    const contentType = this.getLabel(this.props.model.contentType);
    const number = this.getAdaptiveNumber();

    return (
      <React.Fragment>
        <div className="info">
          {contentType} {number}
        </div>
        <div style={{ display: 'flex' }}>
          <span>{toggle}</span>
          {' '}
          <div className={`treenode-item group ${isSelected ? 'selected' : ''}`}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onClick(model);
            }}>
              {model.title}
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  }

  render(): JSX.Element {

    const { highlighted, depth, model } = this.props;
    return (
      <tr className={`${highlighted ? 'table-info' : ''}`}
        key={model.guid}>
        <td>
          <div className="treenode-content">
            <div className="treenode-title" style={{ marginLeft: (depth * 20) }}>
              {this.renderTitle()}
            </div>
          </div>
        </td>
      </tr>
    );
  }
}
