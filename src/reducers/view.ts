import * as viewActions from '../actions/view';
import { user as userActions } from '../actions/user';
import { OtherAction } from './utils';

// The current view of the application can be either the
// Login view, the Create Course view, the View all courses,
// or a document view.  The document view contains an extra
// property, namely the documentId of the document being viewed. 

export type CurrentView = 
  LoginView |
  CreateCourseView |
  AllCoursesView |
  DocumentView |
  OrganizationView;

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

export type OrganizationView = 
{
  type: 'OrganizationView',
  documentId: string
}

const defaultView : LoginView = {
  type: 'LoginView'
}

type ViewAction = 
  viewActions.viewDocumentAction |
  viewActions.viewAllCoursesAction |
  viewActions.viewOrganization |
  userActions.loginSuccessAction | 
  OtherAction


export function view(state : CurrentView = defaultView, action: ViewAction): CurrentView 
{
    switch(action.type) 
    {
        case viewActions.VIEW_DOCUMENT:
                                            const nextView : DocumentView = { type: 'DocumentView', documentId: action.documentId }
                                            return nextView;
        case viewActions.VIEW_ALL_COURSES:
        case userActions.LOGIN_SUCCESS:
                                            return {type: 'AllCoursesView'};
        case viewActions.VIEW_ORGANIZATION:
                                            const nView : OrganizationView = { type: 'OrganizationView', documentId: action.documentId }      
                                            return nView;
        default:
                                            return state;
  }
}
