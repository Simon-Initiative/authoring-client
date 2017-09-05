import * as Immutable from 'immutable';
import * as types from './types';
import * as contentTypes from './contentTypes';
import { getKey } from './common';
import { getChildren } from './content/common';
import guid from '../utils/guid';

import { isArray, isNullOrUndefined } from 'util';

import { Node } from './content/assessment/node';


import { PoolModel } from './models/pool';
import { AssessmentModel } from './models/assessment';
import { CourseModel } from './models/course';
import { DefaultModel } from './models/default';
import { MediaModel } from './models/media';
import { LearningObjectivesModel } from './models/objective';
import { OrganizationModel } from './models/org';
import { SkillsModel } from './models/skill';
import { WorkbookPageModel } from './models/workbook';


export { Node } from './content/assessment/node';
export { PoolModel } from './models/pool';
export { AssessmentModel } from './models/assessment';
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

// tslint:disable-next-line
export const ModelTypes = types.strEnum([
  'CourseModel',
  'WorkbookPageModel',
  'AssessmentModel',
  'MediaModel',
  'OrganizationModel',
  'LearningObjectiveModel',
  'SkillModel',
  'PoolModel',
  'DefaultModel',
]);

// Create an actual type
export type ModelTypes = keyof typeof ModelTypes;

export function isLockable(model: ContentModel) {
  return model.has('lock');
}

export function createModel(object: any): ContentModel {
  switch (object.type) {
    case 'x-oli-package':
      return CourseModel.fromPersistence(object);
    case 'x-oli-workbook_page':
      return WorkbookPageModel.fromPersistence(object);
    case 'x-oli-assessment2':
      return AssessmentModel.fromPersistence(object);
    case 'x-oli-inline-assessment':
      return AssessmentModel.fromPersistence(object);
    case 'x-oli-organization':
      return OrganizationModel.fromPersistence(object);
    case 'x-oli-learning_objectives':
      return LearningObjectivesModel.fromPersistence(object);
    case 'x-oli-skills_model':
      return SkillsModel.fromPersistence(object);
    case 'x-oli-webcontent':
      return MediaModel.fromPersistence(object);
    case 'x-oli-assessment2-pool':
      return PoolModel.fromPersistence(object);
    default:
      return DefaultModel.fromPersistence(object);
  }
}




// >------------------------------------------------------------------

// >------------------------------------------------------------------


export type ContentModel =
  AssessmentModel |
  CourseModel |
  MediaModel |
  WorkbookPageModel |
  OrganizationModel |
  LearningObjectivesModel |
  SkillsModel |
  PoolModel |
  DefaultModel;

// A pure function that takes a content model as
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;

