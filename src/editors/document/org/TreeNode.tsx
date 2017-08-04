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
import { NodeTypes } from './traversal';
import { canHandleDrop } from './utils';

export interface TreeNode {
  
}

export interface TreeNodeProps {
  model: NodeTypes;
  parentModel: any;
  indexWithinParent: number;
  depth: number;
  isExpanded: boolean;
  context: AppContext;
  editMode: boolean;
  toggleExpanded: (guid) => void;
  onReposition: (
    sourceNode: Object, sourceParentGuid: string, targetModel: any, index: number) => void;
}

export interface TreeNodeState {
 
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

    
  }


  render() : JSX.Element {

    const { model, parentModel, indexWithinParent, 
      depth, context, editMode, onReposition, isExpanded } = this.props;
    
    const hasHiddenChildren =
      <span>
        <i className="icon icon-plus"></i>
      </span>;

    const hasShownChildren =
      <span>
        <i className="icon icon-minus"></i>
      </span>;

    const icon = isExpanded ? hasShownChildren : hasHiddenChildren;

    const contentType = this.props.model.contentType;
    let title;
    if (this.props.model.contentType === contentTypes.OrganizationContentTypes.Item) {
      title = <Title toggleExpanded={() => this.props.toggleExpanded(model.guid)}>
        {contentType} - {this.props.context.courseModel
        .resourcesById.get(this.props.model.resourceref.idref).title}</Title>;
    } else {
      title = <Title toggleExpanded={() => this.props.toggleExpanded(model.guid)}>
        {icon} {contentType} - {this.props.model.title}</Title>;
    }

    const finalDropTarget =
     (indexWithinParent === parentModel.children.size - 1)
     ? renderDropTarget(
         indexWithinParent + 1, parentModel, 
         canHandleDrop, onReposition, '')
     : null;
   

    return (
      <div>
        {renderDropTarget(
          indexWithinParent, parentModel, 
          canHandleDrop, onReposition, model.guid)}
        <DraggableNode id={model.guid} editMode={editMode} 
          index={indexWithinParent} source={model} parentModel={parentModel}>
          <DragHandle/>
          <span style={ { marginLeft: (depth * 30) } }>{title}</span>
        </DraggableNode>
        {finalDropTarget}
      </div>
    );
  }

}

