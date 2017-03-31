import * as Immutable from 'immutable';
import * as types from './types';
import * as contentTypes from './contentTypes';


export type EmptyModel = 'EmptyModel';
export const EmptyModel : EmptyModel = 'EmptyModel';

export const ModelTypes = types.strEnum([
  'CourseModel',
  'CoursePermissionModel',
  'WorkbookPageModel',
  'AssessmentModel',
  'MediaModel',
  'OrganizationModel'
])

// Create an actual type
export type ModelTypes = keyof typeof ModelTypes;

export function isLockable(model: ContentModel) {
  return model.has('lock');
}

export function createModel(object: any) : ContentModel {
  switch (object.modelType) {
    case ModelTypes.CourseModel: 
      return new CourseModel(object);
    case ModelTypes.WorkbookPageModel: 
      return new WorkbookPageModel(object);
    case ModelTypes.CoursePermissionModel: 
      return new CoursePermissionModel(object);
    case ModelTypes.AssessmentModel:
      return new AssessmentModel(object);
    case ModelTypes.MediaModel:
      return new MediaModel(object);
    case ModelTypes.OrganizationModel:
      return new OrganizationModel(object);          
  }
}

export type CourseModelParams = {
  title?: contentTypes.TitleContent,
  organizations?: Immutable.List<types.DocumentId>
};

const defaultCourseModel = {
  modelType: 'CourseModel',
  title: new contentTypes.TitleContent(),
  organizations: Immutable.List<types.DocumentId>()
}

export class CourseModel extends Immutable.Record(defaultCourseModel) {
    
  modelType: 'CourseModel';

  title: contentTypes.TitleContent;
  organizations: Immutable.List<types.DocumentId>;

  constructor(params?: CourseModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: CourseModelParams) {
      return this.merge(values) as this;
  }
}

export type OrganizationModelParams = {
  title?: contentTypes.TitleContent
};

const defaultOrganizationModel = {
  modelType: 'OrganizationModel',
  title: new contentTypes.TitleContent(),
}

export class OrganizationModel extends Immutable.Record(defaultOrganizationModel) {    
  modelType: 'OrganizationModel';
  title: contentTypes.TitleContent;
  
  constructor(params?: OrganizationModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: OrganizationModelParams) {
      return this.merge(values) as this;
  }
}

export type MediaModelParams = {
  name: string,
  _attachments: any,
  referencingDocuments: Immutable.List<types.DocumentId>
};
const defaultMediaModelParams = {
  modelType: 'MediaModel',
  name: '',
  _attachments: {},
  referencingDocuments: Immutable.List<types.DocumentId>()
}

export class MediaModel extends Immutable.Record(defaultMediaModelParams) {
    
  modelType: 'MediaModel';

  name: string;
  _attachments: any;
  referencingDocuments: Immutable.List<types.DocumentId>

  constructor(params?: MediaModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: MediaModelParams) {
      return this.merge(values) as this;
  }
}


export type CoursePermissionModelParams = {
  userId: types.UserId,
  courseId: types.DocumentId
};
const defaultCoursePermissionModelParams = {
  modelType: 'CoursePermissionModel',
  userId: '',
  courseId: ''
}

export class CoursePermissionModel extends Immutable.Record(defaultCoursePermissionModelParams) {
    
  modelType: 'CoursePermissionModel';

  userId: types.UserId;
  courseId: types.DocumentId; 

  constructor(params?: CoursePermissionModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: CoursePermissionModelParams) {
      return this.merge(values) as this;
  }
}

export type WorkbookPageModelParams = {
  courseId?: types.DocumentId,
  head?: contentTypes.TitleContent,
  body?: contentTypes.HtmlContent,
  lock?: contentTypes.LockContent
};
const defaultWorkbookPageModelParams = {
  modelType: 'WorkbookPageModel',
  courseId: '',
  head: new contentTypes.TitleContent(),
  body: new contentTypes.HtmlContent(),
  lock: new contentTypes.LockContent()
}

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {
    
  modelType: 'WorkbookPageModel';

  courseId: types.DocumentId;
  head: contentTypes.TitleContent;
  body: contentTypes.HtmlContent;
  lock: contentTypes.LockContent;

  constructor(params?: WorkbookPageModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: WorkbookPageModelParams) {
      return this.merge(values) as this;
  }
}

export type AssessmentModelParams = {
  courseId?: types.DocumentId,
  lock?: contentTypes.LockContent,
  head?: contentTypes.TitleContent,
  context?: contentTypes.HtmlContent,
  assessment?: contentTypes.InlineAssessmentContent
};
const defaultAssessmentModelParams = {
  modelType: 'AssessmentModel',
  courseId: '',
  lock: new contentTypes.LockContent(),
  head: new contentTypes.TitleContent(),
  context: new contentTypes.HtmlContent(),
  assessment: new contentTypes.InlineAssessmentContent()
}

export class AssessmentModel extends Immutable.Record(defaultAssessmentModelParams) {
    
  modelType: 'AssessmentModel';

  courseId: types.DocumentId;
  lock: contentTypes.LockContent;
  head: contentTypes.TitleContent;
  context: contentTypes.HtmlContent;
  assessment: contentTypes.InlineAssessmentContent;

  constructor(params?: AssessmentModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: AssessmentModelParams) {
      return this.merge(values) as this;
  }
}

export type ContentModel = 
  AssessmentModel |
  CourseModel | 
  CoursePermissionModel | 
  MediaModel |
  WorkbookPageModel |
  OrganizationModel;

// A pure function that takes a content model as 
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;
