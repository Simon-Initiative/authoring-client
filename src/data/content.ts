
/** 
 * Utility function to create a K:V from a list of strings 
 */
function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}

export const ModelTypes = strEnum([
  'CourseModel',
  'CoursePermissionModel',
  'WorkbookPageModel',
  'AssessmentModel'
])

// Create an actual type
export type ModelTypes = keyof typeof ModelTypes;

export type DocumentId = string; 
export type UserId = string;

export function isLockable(model : ContentModel) : boolean {
  return 'lockedBy' in model && 'lockedAt' in model;
}

export interface Lockable {
  lockedBy: string;
  lockedAt: number; 
}

export interface HasTitle {
  title: string;
}

export interface CourseModel extends HasTitle {
  modelType: 'CourseModel';
  resources: DocumentId[];
  organizations: DocumentId[];
}
 
export interface CoursePermissionModel {
  modelType: 'CoursePermissionModel';
  userId: UserId;
  courseId: DocumentId; 
}

export interface WorkbookPageModel extends Lockable, HasTitle {
  modelType: 'WorkbookPageModel';
  blocks: Object[];
  entityMap: Object;
}

export interface HtmlContent {
  blocks: Object[];
  entityMap: Object;
}

export interface InlineAssessmentContent {
  timeLimit: number,
  questions: DocumentId[]
}

export interface AssessmentModel extends Lockable, HasTitle {
  modelType: 'AssessmentModel',
  context: HtmlContent,
  assessment: InlineAssessmentContent
}

export type ContentModel = 
  AssessmentModel |
  CourseModel | 
  CoursePermissionModel | 
  WorkbookPageModel;

// Example of how to write a switch statement that
// forces you to cover all possible types of ContentModel
function example1(model: ContentModel) {
  switch (model.modelType) {
      case ModelTypes.CourseModel: 
        console.log('course');
        return;
      case ModelTypes.WorkbookPageModel: 
        console.log('workbook');
        return;
      case ModelTypes.CoursePermissionModel: 
        console.log('permission');
        return;
      case ModelTypes.AssessmentModel:
        console.log('assessment');
        return;
      default: const _exhaustiveCheck: never = model;
  }
}

// Example of how to write a switch statement that
// doesn't cover all possible types of ContentModel
function example2(model: ContentModel) {
  switch (model.modelType) {
      case ModelTypes.CourseModel: 
        console.log('course');
        return;
      default: 
        console.log('something else')
  }
}
