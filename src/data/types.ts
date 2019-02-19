
export type DocumentId = string;
export type CourseId = string;
export type CourseTitle = string;
export type UserId = string;

// Create an actual type
export enum LegacyTypes {
  package = 'x-oli-package',
  workbook_page = 'x-oli-workbook_page',
  assessment2 = 'x-oli-assessment2',
  inline = 'x-oli-inline-assessment',
  feedback = 'x-oli-feedback',
  organization = 'x-oli-organization',
  learning_objective = 'x-oli-objective',
  learning_objectives = 'x-oli-learning_objectives',
  skill = 'x-oli-skill',
  skills_model = 'x-oli-skills_model',
  webcontent = 'x-oli-webcontent',
  assessment2_pool = 'x-oli-assessment2-pool',
}

export type FormativeAssessment = LegacyTypes.inline;
export type SummativeAssessment = LegacyTypes.assessment2;
export type FeedbackAssessment = LegacyTypes.feedback;
export type QuestionPool = LegacyTypes.assessment2_pool;

export type AssessmentType =
  FormativeAssessment |
  SummativeAssessment |
  FeedbackAssessment |
  QuestionPool;

export interface HasGuid {
  guid: string;
}

export interface Cloneable<T> {
  clone(): T;
}

export interface Persistable {
  toPersistence(): Object;
}

export type PaginatedResponse<T> = {
  offset: number;
  limit: number;
  order: string;
  orderBy: string;
  numResults: number;
  totalResults: number;
  results: T[];
};
