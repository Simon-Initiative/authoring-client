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
import { UnsupportedEditor } from '../../content/unsupported/UnsupportedEditor';
import { LegacyTypes } from '../../../data/types';

export type Props = {
  model: models.AssessmentModel | models.PoolModel,
  editMode: boolean,
  context: AppContext,
  services: AppServices,
  skills: Immutable.OrderedMap<string, Skill>,
};

export type EditHandler = (guid: string, node: contentTypes.Node) => void;

export type RemoveHandler = (guid: string) => void;

export function renderAssessmentNode(
  n : models.Node, props: Props, onEdit: EditHandler, onRemove: RemoveHandler) {

  const isParentAssessmentGraded = props.model.resource.type !== LegacyTypes.inline;

  if (n.contentType === 'Question') {
    return <QuestionEditor
            key={n.guid}
            isParentAssessmentGraded={isParentAssessmentGraded}
            editMode={props.editMode}
            services={props.services}
            allSkills={props.skills}
            context={props.context}
            model={n}
            onEdit={c => onEdit(n.guid, c)}
            onRemove={() => onRemove(n.guid)}
            />;

  } else if (n.contentType === 'Content') {
    return <ContentEditor
            key={n.guid}
            editMode={props.editMode}
            services={props.services}
            context={props.context}
            model={n}
            onEdit={c => onEdit(n.guid, c)}
            onRemove={() => onRemove(n.guid)}
            />;
  } else if (n.contentType === 'Selection') {
    return <SelectionEditor
            key={n.guid}
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
