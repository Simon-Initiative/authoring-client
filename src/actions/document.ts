
export module document {
  
  export type VIEW_DOCUMENT = 'VIEW_DOCUMENT';
  export const VIEW_DOCUMENT : VIEW_DOCUMENT = 'VIEW_DOCUMENT';

  export type VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';
  export const VIEW_ALL_COURSES : VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';
  
  export type viewDocumentAction = {
    type: VIEW_DOCUMENT,
    documentId: string
  }

  export function viewDocument(documentId: string) : viewDocumentAction {
    return {
      type: VIEW_DOCUMENT,
      documentId
    }
  }

  export type viewAllCoursesAction = {
    type: VIEW_ALL_COURSES
  }

  export function viewAllCourses() : viewAllCoursesAction {
    return {
      type: VIEW_ALL_COURSES
    }
  }

}
