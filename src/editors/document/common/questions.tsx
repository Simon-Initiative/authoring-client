import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { Skill } from 'types/course';
import { AppContext } from '../../common/AppContext';
import { AppServices } from '../../common/AppServices';
import { QuestionEditor } from '../../content/question/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { SelectionEditor } from '../../content/selection/SelectionEditor';
import { LegacyTypes } from '../../../data/types';
import { ParentContainer } from 'types/active';
import { LikertSeriesEditor } from 'editors/content/feedback/LikertSeriesEditor';
import { LikertEditor } from 'editors/content/feedback/LikertEditor';
import { FeedbackMultipleChoiceEditor }
  from 'editors/content/feedback/multiplechoice/FeedbackMultipleChoiceEditor';
import { FeedbackOpenResponseEditor } from 'editors/content/feedback/FeedbackOpenResponse';

export type Props = {
  model: models.AssessmentModel | models.PoolModel,
  n: models.Node,
  editMode: boolean,
  context: AppContext,
  services: AppServices,
  skills: Immutable.OrderedMap<string, Skill>,
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
  currentPage?: string;
  onEdit: EditHandler,
  onRemove: RemoveHandler,
  onFocus: FocusHandler,
  canRemove: boolean,
  onDuplicate: DuplicateHandler,
  // parent: ParentContainer,
  isQuestionPool: boolean,
};

export type EditHandler = (guid: string, node: contentTypes.Node, src) => void;

export type RemoveHandler = (guid: string) => void;

export type DuplicateHandler = () => void;

export type FocusHandler = (child: Object, parent: any, textSelection) => void;

export class AssessmentNodeRenderer extends React.PureComponent<Props, {}> {
  render() {
    const { editMode, services, context, activeContentGuid, hover, onUpdateHover,
      n, onFocus, onEdit, onRemove, onDuplicate, canRemove, isQuestionPool } = this.props;
    const isParentAssessmentGraded = this.props.model.resource.type !== LegacyTypes.inline;

    const sharedProps = {
      key: n.guid,
      // parent,
      onFocus,
      editMode,
      services,
      context,
      activeContentGuid,
      hover,
      onUpdateHover,
      onEdit: (c, src) => onEdit(n.guid, c, src),
      onRemove: () => onRemove(n.guid),
    };

    let content: JSX.Element;

    if (n.contentType === 'Question') {
      content = <QuestionEditor
        {...sharedProps}
        isQuestionPool={isQuestionPool}
        isParentAssessmentGraded={isParentAssessmentGraded}
        allSkills={this.props.skills}
        model={n}
        onDuplicate={this.props.editMode ? onDuplicate : undefined}
        canRemove={canRemove}
        branchingQuestions={
          this.props.model instanceof models.AssessmentModel && this.props.model.branching
            ? Maybe.just(getBranchingQuestionNumbers(this.props))
            : Maybe.nothing()}
      />;
    }
    if (n.contentType === 'Content') {
      content = <ContentEditor
        {...sharedProps}
        model={n}
      />;
    }
    if (n.contentType === 'Selection') {
      content = <SelectionEditor
        {...sharedProps}
        model={n}
        allSkills={this.props.skills}
        canRemove={canRemove}
      />;
    }
    if (n.contentType === 'LikertSeries') {
      content = <LikertSeriesEditor
        {...sharedProps}
        model={n}
        canRemove={canRemove}
      />;
    }
    if (n.contentType === 'Likert') {
      content = <LikertEditor
        {...sharedProps}
        model={n}
        canRemove={canRemove}
      />;
    }
    if (n.contentType === 'FeedbackMultipleChoice') {
      content = <FeedbackMultipleChoiceEditor
        {...sharedProps}
        model={n}
        canRemove={canRemove}
      />;
    }
    if (n.contentType === 'FeedbackOpenResponse') {
      content = <FeedbackOpenResponseEditor
        {...sharedProps}
        model={n}
        canRemove={canRemove}
      />;
    }

    return (
      <div className="node-container">
        {content}
      </div>
    );
  }
}

function getBranchingQuestionNumbers(props: Props): number[] {
  const pages = (props.model as models.AssessmentModel).pages.keySeq();
  const pagesAfterCount = Math.max(
    pages.skipUntil(p => p === props.currentPage).toArray().length - 1,
    0);
  const questionNumbers = [];
  for (let i = pages.size; i > pages.size - pagesAfterCount; i -= 1) {
    questionNumbers.push(i);
  }

  return questionNumbers.reverse();
}
