import { document as documentActions } from '../actions/document';
import { OtherAction } from './utils';

type DocumentAction = 
  documentActions.viewDocumentAction |
  documentActions.viewAllCoursesAction |
  OtherAction

export function document(state : string = null, action: DocumentAction): string {
  switch(action.type) {
  case documentActions.VIEW_DOCUMENT:
    return action.documentId;
  case documentActions.VIEW_ALL_COURSES:
    return documentActions.VIEW_ALL_COURSES;
  default:
    return state;
  }
}