import * as React from 'react';
import * as Immutable from 'immutable';

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
};

export type EditHandler = (guid: string, node: contentTypes.Node) => void;

export type RemoveHandler = (guid: string) => void;

export type FocusHandler = (child: Object, parent: any) => void;

export function renderAssessmentNode(
  n : models.Node, props: Props, onEdit: EditHandler,
  onRemove: RemoveHandler, onFocus: FocusHandler,
  canRemove: boolean, parent: ParentContainer) {

  const isParentAssessmentGraded = props.model.resource.type !== LegacyTypes.inline;

  if (n.contentType === 'Question') {
    return <QuestionEditor
            key={n.guid}
            parent={parent}
            onFocus={onFocus}
            isParentAssessmentGraded={isParentAssessmentGraded}
            editMode={props.editMode}
            services={props.services}
            allSkills={props.skills}
            context={props.context}
            model={n}
            onEdit={c => onEdit(n.guid, c)}
            canRemove={canRemove}
            onRemove={() => onRemove(n.guid)}
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
            model={n}
            onEdit={c => onEdit(n.guid, c)}
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
            allSkills={props.skills}
            model={n}
            onEdit={c => onEdit(n.guid, c)}
            onRemove={() => onRemove(n.guid)}
            />;
  }
}
