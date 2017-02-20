import { document as documentActions } from '../actions/document';
import { user as userActions } from '../actions/user';
import { OtherAction } from './utils';

type DocumentAction = 
  documentActions.viewDocumentAction |
  documentActions.viewAllCoursesAction |
  userActions.loginSuccessAction | 
  OtherAction

export function document(state : string = null, action: DocumentAction): string {
  switch(action.type) {
  case documentActions.VIEW_DOCUMENT:
    return action.documentId;
  case documentActions.VIEW_ALL_COURSES:
  case userActions.LOGIN_SUCCESS:
    return documentActions.VIEW_ALL_COURSES;
  default:
    return state;
  }
}