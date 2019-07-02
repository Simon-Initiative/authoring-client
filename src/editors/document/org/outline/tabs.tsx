import * as React from 'react';

import * as Tree from 'editors/common/tree';
import { OutlineNode } from './types';
import * as t from 'data/contentTypes';
import './tabs.scss';
import * as org from 'data/models/utils/org';
import { CourseModel, OrganizationModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { RemoveCommand } from '../commands/remove';
import { PreconditionsEditor } from '../PreconditionsEditor';
import { DragHandle } from 'components/common/DragHandle';
import { Remove } from 'components/common/Remove';

export interface TabProps {
  course?: CourseModel;
  placements: org.Placements;
  org: OrganizationModel;
  editMode: boolean;
  node: OutlineNode;
  nodeState: Tree.NodeState<OutlineNode>;
  handlers: Tree.Handlers;
  connectDragSource?: any;
  onView: (id) => void;
  onEdit: (cr: org.OrgChangeRequest) => void;
  commandProcessor: (model, command) => void;
}

export function renderTab(
  course: CourseModel,
  onView: (id) => void,
  onEdit: (cr) => void,
  commandProcessor: (model, command) => void,
  placements: org.Placements,
  org: OrganizationModel,
  editMode: boolean,
  node: OutlineNode,
  nodeState: Tree.NodeState<OutlineNode>,
  handlers: Tree.Handlers,
): JSX.Element {

  const coreProps = {
    nodeState,
    handlers,
    course,
    org,
    placements,
    editMode,
    onEdit,
  };

  switch (node.contentType) {
    case 'Item':
      return <ItemTab {...coreProps}
        node={node} onView={onView} commandProcessor={commandProcessor} />;
    case 'Include':
      return <IncludeTab {...coreProps} node={node}
        onView={onView} commandProcessor={commandProcessor} />;
    default:
      return <ContainerTab {...coreProps} node={node}
        onView={onView} commandProcessor={commandProcessor} />;
  }
}

const buildRemove = (editMode: boolean, model, processor) => {
  const removeCommand = new RemoveCommand();
  return (
    <Remove editMode={editMode} onRemove={() => processor(model, removeCommand)} />
  );
};

const Label = (props) => {
  return <small className="tab-label">{props.children}</small>;
};

const ItemTab = (props: TabProps) => {
  const item = props.node as t.Item;

  const resource = props.course.resourcesById.get(item.resourceref.idref);
  const label = resource.type === LegacyTypes.workbook_page
    ? 'Workbook Page' : 'Assessment';
  const title = resource.title;

  const onEdit = (preconditions) => {
    const cr = org.makeUpdateNode(
      props.node.id,
      n => (n as any).with({ preconditions }),
      n => (n as any).with({ preconditions: (props.node as t.Item).preconditions }));
    props.onEdit(cr);
  };

  const previewLink = (
    <div>
      <button className="btn btn-link" onClick={() => props.onView(resource.id)}>
        {title}
      </button>
      <PreconditionsEditor
        parentId={props.node.id}
        editMode={props.editMode}
        org={props.org}
        placements={props.placements}
        course={props.course}
        preconditions={(props.node as t.Item).preconditions}
        onEdit={onEdit}
      />
    </div>
  );

  return (
    <Tab
      {...props}
      course={props.course}
      label={label}
      previewText={previewLink}
    />
  );

};

const ContainerTab = (props: TabProps) => {
  const label = props.node.contentType;
  const title = (props.node as any).title;

  const previewLink = (
    <button className="btn btn-link" onClick={() => props.onView((props.node as any).id)}>
      {title}
    </button>
  );
  return (
    <Tab
      {...props}
      course={props.course}
      label={label}
      previewText={previewLink}
    />
  );

};


const IncludeTab = (props: TabProps) => {
  return (
    <Tab
      {...props}
      course={props.course}
      label="Include"
      previewText="External content"
    />
  );
};


interface TabProperties {
  course: CourseModel;
  node: OutlineNode;
  nodeState: Tree.NodeState<OutlineNode>;
  handlers: Tree.Handlers;
  previewText: any;
  label: string;
  tooltip?: string;
  connectDragSource?: any;
  commandProcessor: (model, command) => void;
}

class Tab extends React.PureComponent<TabProperties, {}> {

  render(): JSX.Element {
    const {
      node, nodeState, handlers, label, previewText,
      course, children, connectDragSource, commandProcessor,
    } = this.props;

    const classes = 'org-tab-item '
      + (nodeState.isSelected ? 'tab-item-active' : '');

    const indentation = {
      marginLeft: nodeState.depth * 15,
    };

    const tab =
      <div>
        <div onClick={() => handlers.onSelect(node.guid)}
          className={classes}
          style={indentation}>

          {children}

          <div className="d-flex w-100 flex-row justify-content-between">
            <DragHandle />
            <div className="d-flex w-100 flex-column justify-content-between">
              <div className="info d-flex justify-content-between">
                <Label {...this.props}>{label}</Label>
              </div>
              <div className="content">
                {previewText}
              </div>
            </div>
            {buildRemove(course.editable, node, commandProcessor)}
          </div>


        </div>

      </div>;

    return connectDragSource ? connectDragSource(tab) : tab;
  }
}

