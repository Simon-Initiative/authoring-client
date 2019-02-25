import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import * as models from '../../../data/models';
import { renderDropTarget } from '../../content/org/drag/utils';
import { DragHandle } from 'components/common/DragHandle';
import { DraggableNode } from './DraggableNode';
import { getExpandId, NodeTypes } from './traversal';
import { canHandleDrop } from './utils';
import { Caption } from './Caption';
import * as org from 'data/models/utils/org';

import './TreeNode.scss';

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
  onEdit: (request: org.OrgChangeRequest) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  onViewEdit: (id) => void;
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
  timer: any;

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
    this.setState({ mouseOver: true });
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
    }

    return '';
  }

  render(): JSX.Element {

    const { model, parentModel, indexWithinParent,
      depth, editMode, onReposition, isExpanded } = this.props;

    const hasHiddenChildren =
      <span>
        <i className="toggle fa fa-caret-right"></i>
      </span>;

    const hasShownChildren =
      <span>
        <i className="toggle fa fa-caret-down"></i>
      </span>;

    const icon = isExpanded ? hasShownChildren : hasHiddenChildren;

    const contentType = this.getLabel(this.props.model.contentType);


    let titleLabel;
    let viewableId = null;

    if (this.props.model.contentType === contentTypes.OrganizationContentTypes.Item) {

      const resource = this.props.context.courseModel.resourcesById.get(
        this.props.model.resourceref.idref);

      const titleString = resource !== undefined
        ? resource.title
        : 'Loading...';

      titleLabel = <span>{titleString}</span>;
      viewableId = this.props.model.resourceref.idref;

    } else if (this.props.model.contentType === contentTypes.OrganizationContentTypes.Include) {
      titleLabel = 'Include';
      viewableId = this.props.model.idref;
    } else {
      const number = this.getAdaptiveNumber();
      titleLabel = <span>{icon}{contentType} {number}: {this.props.model.title}</span>;
      viewableId = this.props.model.id;
    }

    const title = (
      <Caption
        onViewEdit={() => this.props.onViewEdit(viewableId)}
        depth={0}
        org={this.props.org} context={this.props.context}
        isHoveredOver={this.state.mouseOver}
        editMode={this.props.editMode}
        isSelected={false}
        model={this.props.model}
        toggleExpanded={() => this.props.toggleExpanded(getExpandId(model))}>
        {titleLabel}
      </Caption>
    );

    const finalDropTarget =
      (indexWithinParent === parentModel.children.size - 1)
        ? renderDropTarget(
          indexWithinParent + 1, parentModel,
          canHandleDrop, onReposition, '')
        : null;

    return (
      <tr
        className={`tree-node ${this.props.highlighted ? 'table-info' : ''}`}
        key={model.guid}
        onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}>
        <td className="content">
          <div className="top-drop">
            {renderDropTarget(
              indexWithinParent, parentModel,
              canHandleDrop, onReposition, model.guid)}
          </div>

          <div className="node">
            <DraggableNode
              id={model.guid}
              editMode={editMode}
              index={indexWithinParent}
              source={model}
              parentModel={parentModel}>
              <span style={{ marginLeft: (depth * 20) }} />
              <DragHandle hidden={!editMode || !this.state.mouseOver} />
              {title}
            </DraggableNode>
          </div>

          <div className="bottom-drop">
            {finalDropTarget}
          </div>
        </td>
      </tr>
    );
  }

}

