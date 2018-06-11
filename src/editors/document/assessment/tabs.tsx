import * as React from 'react';

import * as Tree from 'editors/common/tree';
import {
  Node as AssessmentNode, Question, Selection, ContiguousText, Content, Pool, PoolRef,
} from 'data/contentTypes';
import { getLabelForQuestion } from 'editors/content/question/Question';

import './tabs.scss';
import { CourseModel } from 'data/models';

const newText: (type: string) => string = type => 'New ' + type;

export interface TabProps {
  course?: CourseModel;
  node: AssessmentNode;
  nodeState: Tree.NodeState<AssessmentNode>;
  handlers: Tree.Handlers;
  connectDragSource?: any;
}

export function renderTab(
  course: CourseModel, node: AssessmentNode,
  nodeState: Tree.NodeState<AssessmentNode>,
  handlers: Tree.Handlers): JSX.Element {

  switch (node.contentType) {
    case 'Question':
      return <QuestionTab
        node={node} nodeState={nodeState} handlers={handlers} />;
    case 'Content':
      return <ContentTab
        node={node} nodeState={nodeState} handlers={handlers} />;
    case 'Unsupported':
      return <UnsupportedTab
        node={node} nodeState={nodeState} handlers={handlers} />;
    case 'Selection':
      if (node.source.contentType === 'PoolRef') {
        return <PoolRefTab
          course={course} node={node} nodeState={nodeState} handlers={handlers} />;
      }
      return <PoolTab
        course={course} node={node} nodeState={nodeState} handlers={handlers} />;
    default:
      return <UnsupportedTab
        node={node} nodeState={nodeState} handlers={handlers} />;
  }
}

const countSkills = (q: Question): number =>
  q.skills.size + q.parts.toArray().reduce((total, p) => total + p.skills.size, 0);

const strategy = (s: string): string => {
  switch (s) {
    case 'random':
      return 'randomly';
    case 'random_with_replace':
      return 'randomly with duplicates';
    case 'ordered':
      return 'in order';
    default:
      return '';
  }
};

const selection = (s: Selection): string => {
  return 'Selecting '
    + (s.selectionCount) + ' question'
    + (parseInt(s.selectionCount, 10) === 1 ? ' ' : 's ')
    + strategy(s.strategy);
};

const Skills = (props) => {
  const skills = countSkills(props.question);
  const noSkills = skills === 0;
  return (
    <small className={noSkills ? 'no-skills' : 'has-skills'}>
      {skills + ' skill' + (skills === 1 ? '' : 's')}
    </small>
  );
};

const Label = (props) => {
  return <small className="tab-label">{props.children}</small>;
};

const QuestionTab = (props: TabProps) => {
  const q = props.node as Question;


  const textBlocks = q.body.content
    .filter(contentElement => contentElement.contentType === 'ContiguousText');

  const newQuestionText = newText('Question');
  const questionText = textBlocks.size > 0
    ? (textBlocks.first() as ContiguousText)
      .extractPlainText()
      .caseOf({
        just: t => t !== '' ? t : newQuestionText,
        nothing: () => newQuestionText,
      })
    : newQuestionText;

  return (
    <Tab
      {...props}
      label={getLabelForQuestion(q)}
      previewText={questionText}
      showSkills
    />
  );

};

const ContentTab = (props: TabProps) => {
  const c = props.node as Content;

  // Use the first ContiguousText content as the preview text if available,
  // otherwise just use the contentType of the first ContentElement
  const textBlocks = c.body.content
    .filter(contentElement => contentElement.contentType === 'ContiguousText');

  const newContentText = newText('Supporting Content');
  const previewText = textBlocks.size > 0
    ? (textBlocks.first() as ContiguousText)
      .extractPlainText()
      .caseOf({
        just: t => t !== '' ? t : newContentText,
        nothing: () => newContentText,
      })
    : c.body.content.first().contentType;

  return (
    <Tab
      {...props}
      label="Supporting Content"
      previewText={previewText}
    />
  );
};

const UnsupportedTab = (props: TabProps) => {
  return (
    <Tab
      {...props}
      tooltip="This element is not yet supported"
      label="Unsupported"
      previewText=""
    />
  );
};

const PoolTab = (props: TabProps) => {
  const p = props.node as Selection;
  const pool = p.source as Pool;

  const previewText = pool
    ? pool.title.text.extractPlainText().caseOf({
      just: t => t,
      nothing: () => '',
    }) + ' (' + selection(p) + ')'
    : selection(p);

  return (
    <Tab
      {...props}
      tooltip={selection(p)}
      label="Embedded Pool"
      previewText={previewText}
    />
  );
};

const PoolRefTab = (props: TabProps) => {
  const p = props.node as Selection;
  const pool = p.source as PoolRef;

  const previewText = pool
    ? props.course.resourcesById.get(pool.idref).title + ' (' + selection(p) + ')'
    : selection(p);

  return (
    <Tab
      {...props}
      tooltip={selection(p)}
      label="Question Pool"
      previewText={previewText}
    />
  );
};

interface TabProperties {
  node: AssessmentNode;
  nodeState: Tree.NodeState<AssessmentNode>;
  handlers: Tree.Handlers;
  previewText: string;
  label: string;
  tooltip?: string;
  connectDragSource?: any;
  showSkills?: boolean;
}

class Tab extends React.PureComponent<TabProperties, {}> {

  ref: any;

  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
    const {
      node, nodeState, handlers, label, previewText, children, connectDragSource, showSkills,
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

          <div className="d-flex w-100 flex-column justify-content-between">
            <small className="content">
              {`${nodeState.indexWithinParent + 1}. ${previewText}`}
            </small>
            <div className="info d-flex justify-content-between">
              <Label {...this.props}>{label}</Label>
              {showSkills ? <Skills {...this.props} question={node} /> : null}
            </div>
          </div>
        </div>
      </div>;

    return connectDragSource ? connectDragSource(tab) : tab;
  }
}

