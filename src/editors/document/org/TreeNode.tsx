import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import * as models from '../../../data/models';
import { NodeTypes } from './traversal';
import * as org from 'data/models/utils/org';

import './TreeNode.scss';
import { getNameAndIconByType } from 'components/ResourceView';
import { prettyPrintResourceType } from 'components/DeleteResourceModal';
import { LegacyTypes } from 'data/types';

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

      if (resource === undefined) {
        return 'Loading...';
      }

      return (
        <div style={{
          // borderRadius: '.28571429rem',
          // boxShadow: '0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5',
        }}>
          <div style={{
            color: 'rgba(0,0,0,.4)',
          }}
            className={isSelected ? 'selected' : ''}
          >
            <span>{this.getResourceIcon(resource)}</span>
            {' '}
            <span style={{ fontStyle: 'italic' }}>
              {prettyPrintResourceType(resource.type as LegacyTypes)}
            </span>
          </div>
          <div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onClick(model);
            }}
            >
              {resource.title}
            </a>
          </div>
        </div>
      );
    }
    if (this.props.model.contentType === contentTypes.OrganizationContentTypes.Include) {
      return 'Include';
    }

    const toggle = <a href="#" onClick={(e) => {
      e.preventDefault();
      onExpand(model.id);
    }}>
      {isExpanded ? '[-]' : '[+]'}
    </a>;
    const contentType = this.getLabel(this.props.model.contentType);
    const number = this.getAdaptiveNumber();

    return (
      <div style={{
        color: 'rgba(0,0,0,.4)',
        // borderRadius: '.28571429rem',
        // boxShadow: '0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5',
      }}>
        <div>
          <span>{toggle}</span>
          {' '}
          <span
            className={`${isSelected ? 'selected' : ''}`}
            style={{ fontStyle: 'italic' }}>
            {contentType} {number}
          </span>
        </div>
        <div>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            this.props.onClick(model);
          }} className={isSelected ? 'selected' : ''}>
            {model.title}
          </a>
        </div>
      </div>
    );
  }

  render(): JSX.Element {

    const { highlighted, isSelected, depth, model } = this.props;
    return (
      <tr
        className={`${highlighted ? 'table-info' : ''}`}
        key={model.guid}>
        <td>
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


class Card extends React.PureComponent<{}, {}> {
  /*
const toggle = <a href="#" onClick={(e) => {
      e.preventDefault();
      onExpand(model.id);
    }}>
      {isExpanded ? '[-]' : '[+]'}
    </a>;
    const contentType = this.getLabel(this.props.model.contentType);
    const number = this.getAdaptiveNumber();

    return (
      <div style={{
        color: 'rgba(0,0,0,.4)',
        // borderRadius: '.28571429rem',
        // boxShadow: '0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5',
      }}>
        <div>
          <span>{toggle}</span>
          {' '}
          <span
            className={`${isSelected ? 'selected' : ''}`}
            style={{ fontStyle: 'italic' }}>
            {contentType} {number}
          </span>
        </div>
        <div>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            this.props.onClick(model);
          }} className={isSelected ? 'selected' : ''}>
            {model.title}
          </a>
        </div>
      </div>
  */
  // render() {
  //   const { isSelected } = this.props;
  //   return (
  //     <React.Fragment>
  //       <div className={`treenode-info ${isSelected ? 'selected' : ''}`}>
  //         <span>{this.getResourceIcon(resource)}</span>
  //         {' '}
  //         <span style={{ fontStyle: 'italic' }}>
  //           {prettyPrintResourceType(resource.type as LegacyTypes)}
  //         </span>
  //       </div>
  //       <div>
  //         <a href="#" onClick={(e) => {
  //           e.preventDefault();
  //           this.props.onClick(model);
  //         }}>
  //           {resource.title}
  //         </a>
  //       </div>
  //     </React.Fragment>
  //   );
  // }
}
