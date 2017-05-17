import * as models from '../data/models';
import {Resource} from "../data/resource";


export type VIEW_CREATE_COURSE = 'VIEW_CREATE_COURSE';
export const VIEW_CREATE_COURSE = 'VIEW_CREATE_COURSE';

export type viewCreateCourseAction = {
  type: VIEW_CREATE_COURSE
}

export function viewCreateCourse(): viewCreateCourseAction {
  return {
    type: VIEW_CREATE_COURSE
  }
}

export type VIEW_DOCUMENT = 'VIEW_DOCUMENT';
export const VIEW_DOCUMENT: VIEW_DOCUMENT = 'VIEW_DOCUMENT';

export type viewDocumentAction = {
  type: VIEW_DOCUMENT,
  documentId: string
}

export function viewDocument(documentId: string): viewDocumentAction {
  console.log("viewDocument (" + documentId + ")");
  return {
    type: VIEW_DOCUMENT,
    documentId
  }
}

export type VIEW_RESOURCES = 'VIEW_RESOURCES';
export const VIEW_RESOURCES: VIEW_RESOURCES = 'VIEW_RESOURCES';

export type viewResourcesAction = {
  type: VIEW_RESOURCES,
  courseId: string,
  resourceType: string,
  title: string,
  filterFn: (resource: Resource) => boolean,
  createResourceFn: (title: string, type: string) => models.ContentModel
}

export function viewResources(courseId: string, title: string, resourceType: string, filterFn, createResourceFn): viewResourcesAction {
  return {
    type: VIEW_RESOURCES,
    courseId,
    resourceType,
    title,
    filterFn,
    createResourceFn
  }
}

export type VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';
export const VIEW_ALL_COURSES: VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';

export type viewAllCoursesAction = {
  type: VIEW_ALL_COURSES
}

export function viewAllCourses(): viewAllCoursesAction {
  return {
    type: VIEW_ALL_COURSES
  }
}
