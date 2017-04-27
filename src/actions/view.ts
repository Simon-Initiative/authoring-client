import * as models from '../data/models';
import { CourseResource } from '../editors/document/common/resources';

export type VIEW_CREATE_COURSE = 'VIEW_CREATE_COURSE';
export const VIEW_CREATE_COURSE = 'VIEW_CREATE_COURSE';

export type viewCreateCourseAction = {
	type: VIEW_CREATE_COURSE
}

export function viewCreateCourse() : viewCreateCourseAction {
	return {
		type: VIEW_CREATE_COURSE
	}
}

export type VIEW_DOCUMENT = 'VIEW_DOCUMENT';
export const VIEW_DOCUMENT : VIEW_DOCUMENT = 'VIEW_DOCUMENT';

export type viewDocumentAction = {
	type: VIEW_DOCUMENT,
	documentId: string
}

export function viewDocument(documentId: string) : viewDocumentAction {
    console.log ("viewDocument ("+documentId+")");
	return {
		type: VIEW_DOCUMENT,
		documentId
	}
}

export type VIEW_RESOURCES = 'VIEW_RESOURCES';
export const VIEW_RESOURCES : VIEW_RESOURCES = 'VIEW_RESOURCES';

export type viewResourcesAction = {
	type: VIEW_RESOURCES,
	courseId: string,
	title: string,
  filterFn: (resource: CourseResource) => boolean,
  createResourceFn: (title: string, courseId: string) => models.ContentModel
}

export function viewResources(courseId: string, title: string, filterFn, createResourceFn) : viewResourcesAction {
	return {
		type: VIEW_RESOURCES,
		courseId,
		title,
		filterFn,
		createResourceFn
	}
}

export type VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';
export const VIEW_ALL_COURSES : VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';

export type viewAllCoursesAction = {
	type: VIEW_ALL_COURSES
}

export function viewAllCourses() : viewAllCoursesAction {  
	return {
		type: VIEW_ALL_COURSES
	}
}
