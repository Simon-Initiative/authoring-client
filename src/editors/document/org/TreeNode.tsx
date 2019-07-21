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
import { Command } from './commands/command';
import * as commands from './commands/map';

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
  onDispatch: () => void;
  displayModal: (c: any) => void;
  dismissModal: () => void;
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

  buildCommandButtons(
    prefix, commands, org, model,
    labels, processCommand, editMode): Object[] {

    const slash: any = {
      fontFamily: 'sans-serif',
      position: 'relative',
      color: '#606060',
    };

    const buttons = commands[model.contentType].map(commandClass => new commandClass())
      .map(command => [<button
        className="btn btn-link btn-sm" key={prefix + command.description(labels)}
        disabled={!command.precondition(org, model) || !editMode}
        onClick={() => processCommand(command)}>{command.description(labels)}</button>,
      <span key={prefix + command.description(labels) + 'slash'} style={slash}>/</span>])
      .reduce((p, c) => p.concat(c), []);

    buttons.pop();

    return buttons;
  }

  renderInsertExisting(org, model, processor) {
    if (commands.ADD_EXISTING_COMMANDS[model.contentType].length > 0) {
      const buttons = this.buildCommandButtons(
        'addexisting',
        commands.ADD_EXISTING_COMMANDS,
        org, model, org.labels,
        processor, this.props.editMode);

      return [
        <span key="add-existing" className="label">Add existing:</span>,
        ...buttons,
      ];
    }

    return [];
  }

  renderInsertNew(org, model, processor) {
    if (commands.ADD_NEW_COMMANDS[model.contentType].length > 0) {
      return [
        <span key="add-new" className="label">Add new:</span>,
        ...this.buildCommandButtons(
          'addnew',
          commands.ADD_NEW_COMMANDS,
          org, model, org.labels,
          processor, this.props.editMode)];
    }

    return [];
  }

  processCommand(org, model, command: Command) {
    command.execute(
      org, model, this.props.context.courseModel,
      this.props.displayModal, this.props.dismissModal, this.props.onDispatch)
      .then((cr) => {
        this.props.onEdit(cr);
      });
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
        <div>
          <div className={`treenode-item ${isSelected ? 'selected' : ''}`}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onClick(model);
            }}>
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

    const processor = this.processCommand.bind(this, this.props.model, this.props.model);
    // this.renderInsertNew(this.props.model, node, processor);

    const addButton = this.props.model.contentType === 'Item'
      ? undefined
      : (
        <div className="dropdown" style={{ overflow: 'visible' }}>
          <a
            className="add-button"
            data-toggle="dropdown">
            <i className="fas fa-ellipsis-v"></i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <button
              className="dropdown-item"
              onClick={() => { }}>
              New Workbook Page
            </button>
          </div>
        </div>
      );

    return (
      <div style={{
        color: 'rgba(0,0,0,.4)',
      }}>
        {/* {addButton} */}
        <div className={`info ${isSelected ? 'selected' : ''}`}>
          {contentType} {number}
        </div>
        <div style={{ display: 'flex' }}>
          <span style={{ marginRight: '5px' }}>{toggle}</span>
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
          <div className="treenode-content">
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
