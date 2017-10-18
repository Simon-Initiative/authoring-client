import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import * as models from '../../../data/models';
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
  onEdit: (model: NodeTypes) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  onViewEdit: (id) => void;
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

  getAdaptiveNumber() {
    if (this.props.parentModel.contentType !== contentTypes.OrganizationContentTypes.Section) {
      return this.props.numberAtLevel;
    } else {
      return '';
    }
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
      const titleString = resource === undefined 
        ? 'Unknown Resource' 
        : resource.title === null
          ? 'Empty Title'
          : resource.title;

      title = <Caption 
        onViewEdit={() => this.props.onViewEdit(resource.id)}
        labels={this.props.labels}
        depth={0}
        org={this.props.org} context={this.props.context}
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

      const number = this.getAdaptiveNumber();

      title = <EditableCaption 
        labels={this.props.labels}
        depth={0}
        org={this.props.org} context={this.props.context}
        isHoveredOver={this.state.mouseOver}
        processCommand={this.props.processCommand}
        editMode={this.props.editMode}
        onEdit={this.props.onEdit}
        model={this.props.model}
        toggleExpanded={() => this.props.toggleExpanded(getExpandId(model))}>
        {icon} {contentType} {number}: {this.props.model.title}</EditableCaption>;
    }

    const finalDropTarget =
     (indexWithinParent === parentModel.children.size - 1)
     ? renderDropTarget(
         indexWithinParent + 1, parentModel, 
         canHandleDrop, onReposition, '')
     : null;
   
    const highlighted = this.props.highlighted ? 'table-info' : '';


    const outerStyle : any = { position: 'relative', height: '28px', overflow: 'visible' };
    const nodeStyle : any = { position: 'absolute', top: 0, height: '28px', width: '100%' };
    const topDrop : any = { position: 'absolute', top: '-15', height: '15px', width: '100%' };
    const bottomDrop : any = { position: 'absolute', top: '20', height: '15px', width: '100%' };

    return (
      <tr key={model.guid} 
        onMouseEnter={this.onEnter} onMouseLeave={this.onLeave} 
        className={highlighted}>
        <td key="content">

          <div style={outerStyle}>
            <div style={topDrop}>
              {renderDropTarget(
              indexWithinParent, parentModel, 
              canHandleDrop, onReposition, model.guid)}
            </div>
          
            <div style={nodeStyle}>
              <DraggableNode id={model.guid} editMode={editMode} 
                index={indexWithinParent} source={model} parentModel={parentModel}>
                <span style={ { marginLeft: (depth * 30) } }/>
                <DragHandle/>
                {title}
              </DraggableNode>
            </div>
          
            <div style={bottomDrop}>
              {finalDropTarget}
            </div>
          </div>
        
        </td>
      </tr>
    );
  }

}

