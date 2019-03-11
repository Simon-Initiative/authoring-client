import * as persistence from 'data/persistence';
import { CourseModel, ModelTypes, WorkbookPageModel } from 'data/models';
import { Resource } from 'data//contentTypes';
import * as Immutable from 'immutable';
import { fetchSkills } from './skills';
import { fetchObjectives } from './objectives';
import { PLACEHOLDER_ITEM_ID } from '../data/content/org/common';
import { NEW_PAGE_CONTENT } from 'data/models/workbook';


export type COURSE_CHANGED = 'course/COURSE_CHANGED';
export const COURSE_CHANGED: COURSE_CHANGED = 'course/COURSE_CHANGED';

export type CourseChangedAction = {
  type: COURSE_CHANGED,
  model: CourseModel,
};

export type UPDATE_COURSE_RESOURCES = 'course/UPDATE_COURSE_RESOURCES';
export const UPDATE_COURSE_RESOURCES = 'course/UPDATE_COURSE_RESOURCES';

export type UpdateCourseResourcesAction = {
  type: UPDATE_COURSE_RESOURCES,
  resources: Immutable.OrderedMap<string, Resource>;
};

export const updateCourseResources = (resources: Immutable.OrderedMap<string, Resource>)
  : UpdateCourseResourcesAction => ({
    resources,
    type: UPDATE_COURSE_RESOURCES,
  });


/**
 * Course changed action builder
 * @param model - course model
 */
export const courseChanged = (model: CourseModel): CourseChangedAction => ({
  model,
  type: COURSE_CHANGED,
});



function createPlaceholderPage(courseId: string) {

  const resource = WorkbookPageModel.createNew(
    PLACEHOLDER_ITEM_ID, 'Placeholder', NEW_PAGE_CONTENT);

  persistence.createDocument(courseId, resource);

  return resource;
}

export function loadCourse(courseId: string) {
  return function (dispatch: any) {

    return persistence.retrieveCoursePackage(courseId)
      .then((document) => {

        // Notify that the course has changed when a user views a course
        if (document.model.modelType === ModelTypes.CourseModel) {

          const courseModel: CourseModel = document.model;

          if (!document.model.resources.toArray().some(
            resource => resource.id === PLACEHOLDER_ITEM_ID)) {

            const placeholder = createPlaceholderPage(courseId);
            const updatedModel = courseModel.with(
              { resources: courseModel.resources.set(PLACEHOLDER_ITEM_ID, placeholder.resource) });

            dispatch(courseChanged(updatedModel));
            dispatch(fetchSkills(courseId));
            dispatch(fetchObjectives(courseId));
            return updatedModel;

          }

          dispatch(courseChanged(document.model));
          dispatch(fetchSkills(courseId));
          dispatch(fetchObjectives(courseId));
          return document.model;
        }

      })
      .catch(err => console.log(err));
  };
}



