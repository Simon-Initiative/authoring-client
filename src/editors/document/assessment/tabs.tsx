import * as React from 'react';

import * as Tree from 'editors/common/tree';
import { Node as AssessmentNode, Question, Content,
  Pool, PoolRef, Selection } from 'data/contentTypes';
import { getHtmlDetails } from '../../content/common/details';

export interface TabProps {
  node: AssessmentNode;
  nodeState: Tree.NodeState<AssessmentNode>;
  handlers: Tree.Handlers;
}

export function renderTab(
  node: AssessmentNode, nodeState: Tree.NodeState<AssessmentNode>,
  handlers: Tree.Handlers) : JSX.Element {

  switch (node.contentType) {
    case 'Question':
      return <QuestionTab node={node} nodeState={nodeState} handlers={handlers}/>;
    case 'Content':
      return <ContentTab node={node} nodeState={nodeState} handlers={handlers}/>;
    case 'Unsupported':
      return <UnsupportedTab node={node} nodeState={nodeState} handlers={handlers}/>;
    case 'Selection':
      if (node.source.contentType === 'PoolRef') {
        return <PoolRefTab node={node} nodeState={nodeState} handlers={handlers}/>;
      } else {
        return <PoolTab node={node} nodeState={nodeState} handlers={handlers}/>;
      }
    default:
      return <UnsupportedTab node={node} nodeState={nodeState} handlers={handlers}/>;
  }
}

// content = label + leading text

// question = question type as label, leading text, # skills

// pool = label + count# out of #questions

// pool ref = label + count#

const countSkills = (q: Question) : number =>
  q.concepts.size + q.parts.toArray().reduce((total, p) => total + p.concepts.size, 0);

const preview = (html) : string => getHtmlDetails(html, 20);

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
  } else {

    // Look at first item and base label off of that
    const item = question.items.first();

    switch (item.contentType) {

      case 'MultipleChoice':
        if (item.select === 'single') {
          return 'Multiple Choice';
        } else {
          return 'Check All That Apply';
        }
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
  }

};

const Skills = (props) => {
  const skills = countSkills(props.question);
  const style = { color: (props.nodeState.isSelected ? 'white' : 'black') };
  return (
    <small style={style}>
      {skills + ' skill' + (skills === 1 ? '' : 's')}
    </small>
  );
};

const Label = (props) => {
  const style = { color: (props.nodeState.isSelected ? 'white' : 'black') };
  return <small className="mb-1" style={style}>{props.children}</small>;
};

const Pill = props => <span className="badge badge-default badge-pill">{props.children}</span>;

const QuestionTab = (props: TabProps) => {
  const q = props.node as Question;
  return (
    <Tab {...props} tooltip={preview(q.body)}>
      <div className="d-flex w-100 justify-content-between">
        <Label {...props}>{label(q)}</Label>
        <Skills {...props} question={props.node}/>
      </div>
    </Tab>
  );
};

const ContentTab = (props: TabProps) => {
  const c = props.node as Content;
  return (
    <Tab {...props} tooltip={preview(c.body)}>
      <div className="d-flex w-100 justify-content-between">
        <Label {...props}>Content</Label>
      </div>
    </Tab>
  );
};


const UnsupportedTab = (props: TabProps) => {
  return (
    <Tab {...props} tooltip="This element is not yet supported">
      <div className="d-flex w-100 justify-content-between">
        <Label {...props}>Unsupported</Label>
      </div>
    </Tab>
  );
};

const PoolTab = (props: TabProps) => {
  const p = ((props.node as Selection).source as Pool);
  return (
    <Tab {...props} tooltip={selection(props.node as Selection)}>
      <div className="d-flex w-100 justify-content-between">
        <Label {...props}>Embedded Pool</Label>
      </div>
    </Tab>
  );
};

const PoolRefTab = (props: TabProps) => {
  const p = ((props.node as Selection).source as Pool);
  return (
    <Tab {...props} tooltip={selection(props.node as Selection)}>
      <div className="d-flex w-100 justify-content-between">
        <Label {...props}>External Pool</Label>
      </div>
    </Tab>
  );
};

interface TabProperties {
  node: AssessmentNode;
  nodeState: Tree.NodeState<AssessmentNode>;
  handlers: Tree.Handlers;
  tooltip: string;
}

class Tab extends React.PureComponent<TabProperties, {}> {

  ref: any;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // (window as any).$(this.ref).tooltip(
    //  { delay: { show: 1000, hide: 100 } },
    // );
  }

  componentWillUnmount() {
    // (window as any).$(this.ref).tooltip('hide');
  }

  render() : JSX.Element {
    const style = { paddingLeft: '5px', paddingTop: '3px',
      paddingBottom: '1px', paddingRight: '5px' };
    const classes = 'list-group-item list-group-item-action flex-column align-items-start '
      + (this.props.nodeState.isSelected ? 'active' : '');

    return (
      <a onClick={() => this.props.handlers.onSelect(this.props.node.guid)} style={style}
        ref={a => this.ref = a}
        data-toggle="tooltip"
        className={classes}>
          {this.props.children}
      </a>
    );
  }

}

