import * as viewActions from '../actions/view';
import { user as userActions } from '../actions/user';
import { OtherAction } from './utils';
import * as models from '../data/models';
//import { CourseResource } from '../editors/document/common/resources';
import {Resource} from "../data/resource";


// The current view of the application can be either the
// Login view, the Create Course view, the View all courses,
// or a document view.  The document view contains an extra
// property, namely the documentId of the document being viewed. 

export type CurrentView = 
  LoginView |
  CreateCourseView |
  AllCoursesView |
  ResourcesView |
  DocumentView;

export type LoginView = {
  type: 'LoginView'
};
export type DocumentView = 
{
  type: 'DocumentView',
  documentId: string
};
export type CreateCourseView = {
  type: 'CreateCourseView'
}
export type AllCoursesView = {
  type: 'AllCoursesView'
}
export type ResourcesView = {
  type: 'ResourcesView',
  courseId: string,
  title: string,
  filterFn: (resource: Resource) => boolean,
  createResourceFn: (title: string, courseId: string) => models.ContentModel
}

const defaultView : LoginView = {
  type: 'LoginView'
}

type ViewAction = 
  viewActions.viewDocumentAction |
  viewActions.viewAllCoursesAction |
  viewActions.viewCreateCourseAction |
  viewActions.viewResourcesAction |
  userActions.loginSuccessAction | 

  OtherAction

export function view(state : CurrentView = defaultView, action: ViewAction): CurrentView {
  switch (action.type) {
    case viewActions.VIEW_DOCUMENT:
      const nextView : DocumentView = { type: 'DocumentView', documentId: action.documentId }
      return nextView;
    case viewActions.VIEW_RESOURCES:
      return { type: 'ResourcesView', courseId: action.courseId, title: action.title, 
        filterFn: action.filterFn, createResourceFn: action.createResourceFn};
    case viewActions.VIEW_CREATE_COURSE:
      return { type: 'CreateCourseView'};
    case viewActions.VIEW_ALL_COURSES: // Deliberate fall through
    case userActions.LOGIN_SUCCESS:
      return { type: 'AllCoursesView'}; 
    default:
      return state;
  }
}
