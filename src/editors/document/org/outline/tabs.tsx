import * as React from 'react';

import * as Tree from 'editors/common/tree';
import { OutlineNode } from './types';
import * as t from 'data/contentTypes';
import './tabs.scss';
import { CourseModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { RemoveCommand } from '../commands/remove';

export interface TabProps {
  course?: CourseModel;
  node: OutlineNode;
  nodeState: Tree.NodeState<OutlineNode>;
  handlers: Tree.Handlers;
  connectDragSource?: any;
  onView: (id) => void;
  commandProcessor: (model, command) => void;
}

export function renderTab(
  course: CourseModel,
  onView: (id) => void,
  commandProcessor: (model, command) => void,
  node: OutlineNode,
  nodeState: Tree.NodeState<OutlineNode>,
  handlers: Tree.Handlers): JSX.Element {

  const coreProps = {
    nodeState,
    handlers,
    course,
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
    <button
      className="btn btn-link btn-sm" key="remove"
      style={{ color: 'gray ' }}
      disabled={!editMode}
      onClick={() => processor(model, removeCommand)}>
      <i className="fa fa-times" aria-hidden="true"></i>
    </button>
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

  const previewLink = (
    <button className="btn btn-link" onClick={() => props.onView(resource.guid)}>
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

    const classes = 'tab-item '
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
            <div className="d-flex w-100 flex-column justify-content-between">
              <small className="content">
                {previewText}
              </small>
              <div className="info d-flex justify-content-between">
                <Label {...this.props}>{label}</Label>
              </div>
            </div>
            {buildRemove(course.editable, node, commandProcessor)}
          </div>


        </div>

      </div>;

    return connectDragSource ? connectDragSource(tab) : tab;
  }
}

