import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import guid from '../../../utils/guid';
import { renderDraggableTreeNode, canAcceptDrop, 
  SourceNodeType, renderDropTarget } from '../../content/org/drag/utils';
import { DragHandle } from '../../content/org/drag/DragHandle';
import { DraggableNode } from './DraggableNode';
import { NodeTypes, getExpandId } from './traversal';
import { canHandleDrop } from './utils';
import { EditableCaption } from './EditableCaption';
import { Caption } from './Caption';
import { Command } from './commands/command';

export interface TreeNode {
  timer: any;
}

export interface TreeNodeProps {
  highlighted: boolean;
  labels: contentTypes.Labels;
  model: NodeTypes;
  parentModel: any;
  indexWithinParent: number;
  depth: number;
  isExpanded: boolean;
  context: AppContext;
  onEdit: (model: NodeTypes) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  processCommand: (command: Command) => void;
  onReposition: (
    sourceNode: Object, sourceParentGuid: string, targetModel: any, index: number) => void;
}

export interface TreeNodeState {
  mouseOver: boolean;
}

// tslint:disable-next-line
const Title = (props) => {
  return (
    <button onClick={() => props.toggleExpanded()} 
        type="button" className="btn btn-link">{props.children}</button>
  );
};


export class TreeNode 
  extends React.PureComponent<TreeNodeProps, TreeNodeState> {
    
  constructor(props) {
    super(props);

    this.timer = null;

    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);

    this.state = { mouseOver: false };
  }

  getLabel(contentType: string) {

    if (contentType === 'Item') {
      return 'Resource';
    }

    return this.props.labels[contentType.toLowerCase()];
  }


  onEnter() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.setState({ mouseOver: true }), 250);
    
  }

  onLeave() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.setState({ mouseOver: false });
  }

  render() : JSX.Element {

    const { model, parentModel, indexWithinParent, 
      depth, context, editMode, onReposition, isExpanded } = this.props;
    
    const hasHiddenChildren =
      <span>
        <i className="icon icon-caret-right"></i>
      </span>;

    const hasShownChildren =
      <span>
        <i className="icon icon-caret-down"></i>
      </span>;

    const icon = isExpanded ? hasShownChildren : hasHiddenChildren;

    const contentType = this.getLabel(this.props.model.contentType);
    let title;
    if (this.props.model.contentType === contentTypes.OrganizationContentTypes.Item) {

      const resource = this.props.context.courseModel.resourcesById.get(
        this.props.model.resourceref.idref);
      const titleString = resource === undefined ? '' : resource.title;

      title = <Caption 
        labels={this.props.labels}
        depth={0}
        isHoveredOver={this.state.mouseOver}
        processCommand={this.props.processCommand}
        editMode={this.props.editMode}
        onEdit={this.props.onEdit}
        model={this.props.model}
        toggleExpanded={() => this.props.toggleExpanded(getExpandId(model))}>
        {titleString}</Caption>;
    } else if (this.props.model.contentType === contentTypes.OrganizationContentTypes.Include) {
      title = <Title toggleExpanded={() => this.props.toggleExpanded(getExpandId(model))}>
        Include</Title>;
    } else {
      title = <EditableCaption 
        labels={this.props.labels}
        depth={0}
        isHoveredOver={this.state.mouseOver}
        processCommand={this.props.processCommand}
        editMode={this.props.editMode}
        onEdit={this.props.onEdit}
        model={this.props.model}
        toggleExpanded={() => this.props.toggleExpanded(getExpandId(model))}>
        {icon} {contentType} - {this.props.model.title}</EditableCaption>;
    }

    const finalDropTarget =
     (indexWithinParent === parentModel.children.size - 1)
     ? renderDropTarget(
         indexWithinParent + 1, parentModel, 
         canHandleDrop, onReposition, '')
     : null;
   
    const highlighted = this.props.highlighted ? 'table-info' : '';

    return (
      <tr key={model.guid} 
        onMouseEnter={this.onEnter} onMouseLeave={this.onLeave} 
        className={highlighted}>
        <td key="content">
          {renderDropTarget(
          indexWithinParent, parentModel, 
          canHandleDrop, onReposition, model.guid)}
        <DraggableNode id={model.guid} editMode={editMode} 
          index={indexWithinParent} source={model} parentModel={parentModel}>
          <span style={ { marginLeft: (depth * 30) } }/>
          <DragHandle/>
          {title}
        </DraggableNode>
        {finalDropTarget}
        </td>
      </tr>
    );
  }

}

