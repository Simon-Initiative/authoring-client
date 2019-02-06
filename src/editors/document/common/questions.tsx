import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as models from 'data/models';
import { Skill } from 'types/course';
import { QuestionEditor } from '../../content/question/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { SelectionEditor } from '../../content/selection/SelectionEditor';
import { LegacyTypes } from '../../../data/types';
import { LikertSeriesEditor } from 'editors/content/feedback/likertseries/LikertSeriesEditor';
import { LikertEditor } from 'editors/content/feedback/singlequestion/LikertEditor';
import { FeedbackMultipleChoiceEditor }
  from 'editors/content/feedback/multiplechoice/FeedbackMultipleChoiceEditor';
import { FeedbackOpenResponseEditor }
  from 'editors/content/feedback/openresponse/FeedbackOpenResponse';
import './questions.scss';
import { AbstractContentEditorProps } from 'editors/content/common/AbstractContentEditor';
import { Node } from 'data/content/assessment/node';
import { AssessmentModel } from 'data/models/assessment';
import { PoolModel } from 'data/models/pool';
import { FeedbackModel } from 'data/models/feedback';

export interface Props extends AbstractContentEditorProps<Node> {
  nodeParentModel: AssessmentModel | PoolModel | FeedbackModel;
  allSkills: Immutable.OrderedMap<string, Skill>;
  currentPage?: string;
  onRemove: RemoveHandler;
  canRemove: boolean;
  onDuplicate: DuplicateHandler;
  isQuestionPool: boolean;
}

export type RemoveHandler = (guid: string) => void;

export type DuplicateHandler = () => void;

export class AssessmentNodeRenderer extends React.PureComponent<Props, {}> {
  render() {
    const { currentPage, onRemove, onDuplicate, model, nodeParentModel, editMode } = this.props;
    const isParentAssessmentGraded = nodeParentModel.resource.type !== LegacyTypes.inline;

    const sharedProps = {
      ...this.props,
      key: model.guid,
      onRemove: () => onRemove(model.guid),
      onDuplicate: editMode ? onDuplicate : undefined,
    };

    const isFeedback = model.contentType === 'FeedbackMultipleChoice' ||
      model.contentType === 'FeedbackOpenResponse' ||
      model.contentType === 'Likert' ||
      model.contentType === 'LikertSeries';

    let content: JSX.Element;

    if (model.contentType === 'Question') {
      content = <QuestionEditor
        {...sharedProps}
        isParentAssessmentGraded={isParentAssessmentGraded}
        model={model}
        // onDuplicate={this.props.editMode ? onDuplicate : undefined}
        branchingQuestions={
          nodeParentModel instanceof models.AssessmentModel && nodeParentModel.branching
            ? Maybe.just(getBranchingQuestionNumbers(nodeParentModel, currentPage))
            : Maybe.nothing()}
      />;
    }
    if (model.contentType === 'Content') {
      content = <ContentEditor
        {...sharedProps}
        model={model}
      />;
    }
    if (model.contentType === 'Selection') {
      content = <SelectionEditor
        {...sharedProps}
        model={model}
      />;
    }
    if (model.contentType === 'LikertSeries') {
      content = <LikertSeriesEditor
        {...sharedProps}
        model={model}
      />;
    }
    if (model.contentType === 'Likert') {
      content = <LikertEditor
        {...sharedProps}
        model={model}
      />;
    }
    if (model.contentType === 'FeedbackMultipleChoice') {
      content = <FeedbackMultipleChoiceEditor
        {...sharedProps}
        model={model}
      />;
    }
    if (model.contentType === 'FeedbackOpenResponse') {
      content = <FeedbackOpenResponseEditor
        {...sharedProps}
        model={model}
      />;
    }

    return (
      <div className={`node-container ${isFeedback ? 'feedback-question' : ''}`}>
        {content}
      </div>
    );
  }
}

function getBranchingQuestionNumbers(model: models.AssessmentModel, currentPage: string): number[] {
  const pages = model.pages.keySeq();
  const pagesAfterCount = Math.max(
    pages.skipUntil(p => p === currentPage).toArray().length - 1,
    0);
  const questionNumbers = [];
  for (let i = pages.size; i > pages.size - pagesAfterCount; i -= 1) {
    questionNumbers.push(i);
  }

  return questionNumbers.reverse();
}
