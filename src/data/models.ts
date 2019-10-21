import * as types from './types';

import { PoolModel } from './models/pool';
import { AssessmentModel } from './models/assessment';
import { FeedbackModel } from './models/feedback';
import { CourseModel } from './models/course';
import { MediaModel } from './models/media';
import { LearningObjectivesModel } from './models/objective';
import { OrganizationModel } from './models/org';
import { SkillsModel } from './models/skill';
import { WorkbookPageModel } from './models/workbook';
import { EmbedActivityModel } from './models/embedactivity';

export { Node, AssessmentNode, FeedbackQuestionNode } from './content/assessment/node';
export { PoolModel } from './models/pool';
export { AssessmentModel } from './models/assessment';
export { FeedbackModel } from './models/feedback';
export { EmbedActivityModel } from './models/embedactivity';
export { CourseModel } from './models/course';
export { DefaultModel } from './models/default';
export { MediaModel } from './models/media';
export { LearningObjectivesModel } from './models/objective';
export { OrganizationModel } from './models/org';
export { SkillsModel } from './models/skill';
export { WorkbookPageModel } from './models/workbook';

export type EmptyModel = 'EmptyModel';
// tslint:disable-next-line
export const EmptyModel: EmptyModel = 'EmptyModel';

export enum ModelTypes {
  CourseModel = 'CourseModel',
  WorkbookPageModel = 'WorkbookPageModel',
  AssessmentModel = 'AssessmentModel',
  FeedbackModel = 'FeedbackModel',
  EmbedActivityModel = 'EmbedActivityModel',
  MediaModel = 'MediaModel',
  OrganizationModel = 'OrganizationModel',
  LearningObjectiveModel = 'LearningObjectiveModel',
  SkillModel = 'SkillModel',
  PoolModel = 'PoolModel',
  DefaultModel = 'DefaultModel',
}

export function isLockable(model: ContentModel) {
  return model.has('lock');
}

export function createModel(object: any, notify: () => void = () => null): ContentModel {
  // only enabled this for workbook page, a2, inline, organization, pools

  switch (object.type) {
    case types.LegacyTypes.package:
      return CourseModel.fromPersistence(object);
    case types.LegacyTypes.workbook_page:
      return WorkbookPageModel.fromPersistence(object, notify);
    case types.LegacyTypes.assessment2:
      return AssessmentModel.fromPersistence(object, notify);
    case types.LegacyTypes.inline:
      return AssessmentModel.fromPersistence(object, notify);
    case types.LegacyTypes.feedback:
      return FeedbackModel.fromPersistence(object, notify);
    case types.LegacyTypes.embed_activity:
      return EmbedActivityModel.fromPersistence(object, notify);
    case types.LegacyTypes.organization:
      return OrganizationModel.fromPersistence(object, notify);
    case types.LegacyTypes.learning_objectives:
      return LearningObjectivesModel.fromPersistence(object);
    case types.LegacyTypes.skills_model:
      return SkillsModel.fromPersistence(object);
    case types.LegacyTypes.webcontent:
      return MediaModel.fromPersistence(object);
    case types.LegacyTypes.assessment2_pool:
      return PoolModel.fromPersistence(object, notify);
  }
}




// >------------------------------------------------------------------

// >------------------------------------------------------------------


export type ContentModel =
  AssessmentModel |
  FeedbackModel |
  EmbedActivityModel |
  CourseModel |
  MediaModel |
  WorkbookPageModel |
  OrganizationModel |
  LearningObjectivesModel |
  SkillsModel |
  PoolModel;

// A pure function that takes a content model as
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;

