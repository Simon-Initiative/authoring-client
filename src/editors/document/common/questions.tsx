import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { Skill } from 'types/course';
import { AppContext } from '../../common/AppContext';
import { AppServices } from '../../common/AppServices';
import { QuestionEditor } from '../../content/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { SelectionEditor } from '../../content/selection/SelectionEditor';
import { LegacyTypes } from '../../../data/types';
import { ParentContainer } from 'types/active';

export type Props = {
  model: models.AssessmentModel | models.PoolModel,
  editMode: boolean,
  context: AppContext,
  services: AppServices,
  skills: Immutable.OrderedMap<string, Skill>,
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
  currentPage?: string;
};

export type EditHandler = (guid: string, node: contentTypes.Node, src) => void;

export type RemoveHandler = (guid: string) => void;

export type DuplicateHandler = () => void;

export type FocusHandler = (child: Object, parent: any, textSelection) => void;

function getBranchingQuestionNumbers(props: Props): number[] {
  const pages = (props.model as models.AssessmentModel).pages.keySeq();
  const pagesAfterCount = Math.max(
    pages.skipUntil(p => p === props.currentPage).toArray().length - 1,
    0);
  const questionNumbers = [];
  console.log('pages', pages);
  console.log('pagesAfterCount', pagesAfterCount);
  console.log('currentpage', props.currentPage);
  for (let i = pages.size; i > pages.size - pagesAfterCount; i -= 1) {
    questionNumbers.push(i);
  }

  console.log('questionnumbers', questionNumbers);
  return questionNumbers.reverse();
}

export function renderAssessmentNode(
  n: models.Node, props: Props, onEdit: EditHandler,
  onRemove: RemoveHandler, onFocus: FocusHandler,
  canRemove: boolean,
  onDuplicate: DuplicateHandler,
  parent: ParentContainer, isQuestionPool: boolean) {

  const isParentAssessmentGraded = props.model.resource.type !== LegacyTypes.inline;

  if (n.contentType === 'Question') {
    return <QuestionEditor
      key={n.guid}
      parent={parent}
      onFocus={onFocus}
      isQuestionPool={isQuestionPool}
      isParentAssessmentGraded={isParentAssessmentGraded}
      editMode={props.editMode}
      services={props.services}
      allSkills={props.skills}
      context={props.context}
      activeContentGuid={props.activeContentGuid}
      hover={props.hover}
      onUpdateHover={props.onUpdateHover}
      model={n}
      onDuplicate={props.editMode ? onDuplicate : undefined}
      onEdit={(c, src) => onEdit(n.guid, c, src)}
      canRemove={canRemove}
      onRemove={() => onRemove(n.guid)}
      branchingQuestions={
        props.model instanceof models.AssessmentModel
          ? Maybe.just(getBranchingQuestionNumbers(props))
          : Maybe.nothing()}
    />;
  }
  if (n.contentType === 'Content') {
    return <ContentEditor
      parent={parent}
      key={n.guid}
      onFocus={onFocus}
      editMode={props.editMode}
      services={props.services}
      context={props.context}
      activeContentGuid={props.activeContentGuid}
      hover={props.hover}
      onUpdateHover={props.onUpdateHover}
      model={n}
      onEdit={(c, src) => onEdit(n.guid, c, src)}
      onRemove={() => onRemove(n.guid)}
    />;
  }
  if (n.contentType === 'Selection') {
    return <SelectionEditor
      parent={parent}
      key={n.guid}
      onFocus={onFocus}
      isParentAssessmentGraded={isParentAssessmentGraded}
      editMode={props.editMode}
      services={props.services}
      context={props.context}
      activeContentGuid={props.activeContentGuid}
      hover={props.hover}
      onUpdateHover={props.onUpdateHover}
      allSkills={props.skills}
      model={n}
      canRemove={canRemove}
      onEdit={(c, src) => onEdit(n.guid, c, src)}
      onRemove={() => onRemove(n.guid)}
    />;
  }
}
