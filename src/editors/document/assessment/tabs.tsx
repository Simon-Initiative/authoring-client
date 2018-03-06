import * as React from 'react';

import * as Tree from 'editors/common/tree';
import {
  Content, Node as AssessmentNode, Question, Selection,
} from 'data/contentTypes';
import { DragHandle } from './DragHandle';

import './tabs.scss';

export interface TabProps {
  node: AssessmentNode;
  nodeState: Tree.NodeState<AssessmentNode>;
  handlers: Tree.Handlers;
  connectDragSource?: any;
}

export function renderTab(
  node: AssessmentNode, nodeState: Tree.NodeState<AssessmentNode>,
  handlers: Tree.Handlers) : JSX.Element {

  switch (node.contentType) {
    case 'Question':
      return <QuestionTab
        node={node} nodeState={nodeState} handlers={handlers}/>;
    case 'Content':
      return <ContentTab
        node={node} nodeState={nodeState} handlers={handlers}/>;
    case 'Unsupported':
      return <UnsupportedTab
        node={node} nodeState={nodeState} handlers={handlers}/>;
    case 'Selection':
      if (node.source.contentType === 'PoolRef') {
        return <PoolRefTab
          node={node} nodeState={nodeState} handlers={handlers}/>;
      }
      return <PoolTab
        node={node} nodeState={nodeState} handlers={handlers}/>;
    default:
      return <UnsupportedTab
        node={node} nodeState={nodeState} handlers={handlers}/>;
  }
}

const countSkills = (q: Question) : number =>
  q.skills.size + q.parts.toArray().reduce((total, p) => total + p.skills.size, 0);

const strategy = (s : string) : string => {
  switch (s) {
    case 'random':
      return 'randomly';
    case 'random_with_replace':
      return 'randomly (with replace)';
    case 'orderd':
      return 'in order';
  }
};

const selection = (s : Selection) : string => {
  return 'Selecting '
    + (s.selectionCount) + ' question'
    + (parseInt(s.selectionCount, 10) === 1 ? ' ' : 's ')
    + strategy(s.strategy);
};

const label = (question: Question) : string => {

  if (question.items.size === 0) {
    return 'Input';
  }

  // Look at first item and base label off of that
  const item = question.items.first();

  switch (item.contentType) {

    case 'MultipleChoice':
      if (item.select === 'single') {
        return 'Multiple Choice';
      }
      return 'Check All That Apply';
    case 'Ordering':
      return 'Ordering';
    case 'Essay':
      return 'Essay';
    case 'ShortAnswer':
      return 'Short Answer';
    case 'Text':
    case 'Numeric':
    case 'FillInTheBlank':
      return 'Input';
    default:
      return 'Question';
  }

};

const Skills = (props) => {
  const skills = countSkills(props.question);
  return (
    <small>
      {skills + ' skill' + (skills === 1 ? '' : 's')}
    </small>
  );
};

const Label = (props) => {
  return <small className="mb-1">{props.children}</small>;
};

const QuestionTab = (props: TabProps) => {
  const q = props.node as Question;
  return (
    <Tab {...props}>
      <div className="d-flex w-100 justify-content-between">
        <div>
          <DragHandle connectDragSource={props.connectDragSource}/>
          &nbsp;
          <Label {...props}>{label(q)}</Label>
        </div>
        <Skills {...props} question={props.node}/>
      </div>
    </Tab>
  );
};

const ContentTab = (props: TabProps) => {
  return (
    <Tab {...props}>
      <div className="d-flex w-100 justify-content-between">
        <div>
          <DragHandle connectDragSource={props.connectDragSource}/>
          &nbsp;
          <Label {...props}>Content</Label>
        </div>
      </div>
    </Tab>
  );
};


const UnsupportedTab = (props: TabProps) => {
  return (
    <Tab {...props} tooltip="This element is not yet supported">
      <div className="d-flex w-100 justify-content-between">
        <div>
        <DragHandle connectDragSource={props.connectDragSource}/>
        &nbsp;
        <Label {...props}>Unsupported</Label>
        </div>
      </div>
    </Tab>
  );
};

const PoolTab = (props: TabProps) => {
  return (
    <Tab {...props} tooltip={selection(props.node as Selection)}>
      <div className="d-flex w-100 justify-content-between">
        <div>
        <DragHandle connectDragSource={props.connectDragSource}/>
        &nbsp;
        <Label {...props}>Embedded Pool</Label>
        </div>
      </div>
    </Tab>
  );
};

const PoolRefTab = (props: TabProps) => {
  return (
    <Tab {...props} tooltip={selection(props.node as Selection)}>
      <div className="d-flex w-100 justify-content-between">
      <div>
        <DragHandle connectDragSource={props.connectDragSource}/>
        &nbsp;
        <Label {...props}>Question Pool</Label>
        </div>
      </div>
    </Tab>
  );
};

interface TabProperties {
  node: AssessmentNode;
  nodeState: Tree.NodeState<AssessmentNode>;
  handlers: Tree.Handlers;
  tooltip?: string;
}

class Tab extends React.PureComponent<TabProperties, {}> {

  ref: any;

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {

    const classes = 'tab-item '
      + (this.props.nodeState.isSelected ? 'tab-item-active' : '');

    const indentation = {
      marginLeft: this.props.nodeState.depth * 15,
    };

    return (
      <div onClick={() => this.props.handlers.onSelect(this.props.node.guid)}
        className={classes}>
        <div style={indentation}>
          {this.props.children}
        </div>
      </div>
    );
  }

}

