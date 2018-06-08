import * as React from 'react';

import * as Tree from 'editors/common/tree';
import {
  Node as AssessmentNode, Question, Selection, ContiguousText, Content, Pool, PoolRef,
} from 'data/contentTypes';
import { getLabelForQuestion } from 'editors/content/question/Question';

import './tabs.scss';

const newText: (type: string) => string = type => 'New ' + type;

export interface TabProps {
  node: AssessmentNode;
  nodeState: Tree.NodeState<AssessmentNode>;
  handlers: Tree.Handlers;
  connectDragSource?: any;
}

export function renderTab(
  node: AssessmentNode, nodeState: Tree.NodeState<AssessmentNode>,
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
          node={node} nodeState={nodeState} handlers={handlers} />;
      }
      return <PoolTab
        node={node} nodeState={nodeState} handlers={handlers} />;
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
      return 'randomly (with replace)';
    case 'orderd':
      return 'in order';
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
    <small className={noSkills ? 'noSkills' : 'hasSkills'}>
      {skills + ' skill' + (skills === 1 ? '' : 's')}
    </small>
  );
};

const Label = (props) => {
  return <small className="tabLabel">{props.children}</small>;
};

const QuestionTab = (props: TabProps) => {
  const q = props.node as Question;

  const newQuestionText = newText('Question');

  const questionText = (q.body.content.first() as ContiguousText)
    .extractPlainText()
    .caseOf({
      just: t => t !== '' ? t : newQuestionText,
      nothing: () => newQuestionText,
    });

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

  const newPoolText = newText('Embedded Pool');

  const poolTitle = (p.source as Pool).title.text.extractPlainText().caseOf({
    just: t => t !== '' ? t : newPoolText,
    nothing: () => newPoolText,
  });

  return (
    <Tab
      {...props}
      tooltip={selection(props.node as Selection)}
      label="Embedded Pool"
      previewText={poolTitle}
    />
  );
};

const PoolRefTab = (props: TabProps) => {
  const p = props.node as Selection;

  const newPoolRefText = newText('Question Pool');

  const poolTitle = 'Question Pool';

  return (
    <Tab
      {...props}
      tooltip={selection(props.node as Selection)}
      label="Question Pool"
      previewText={poolTitle}
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

