
export type DocumentId = string;
export type CourseId = string;
export type UserId = string;

// Create an actual type
export enum LegacyTypes {
  package = 'x-oli-package',
  workbook_page = 'x-oli-workbook_page',
  assessment2 = 'x-oli-assessment2',
  inline = 'x-oli-inline-assessment',
  organization = 'x-oli-organization',
  learning_objectives = 'x-oli-learning_objectives',
  skills_model = 'x-oli-skills_model',
  webcontent = 'x-oli-webcontent',
  assessment2_pool = 'x-oli-assessment2-pool',
}

export interface HasGuid {
  guid: string;
}

export interface Cloneable<T> {
  clone(): T;
}

export interface Persistable {
  toPersistence(): Object;
}
