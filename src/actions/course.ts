import * as persistence from 'data/persistence';
import { CourseModel, ModelTypes, WorkbookPageModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { Resource } from 'data//contentTypes';
import * as Immutable from 'immutable';
import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { viewDocument } from './view';
import { fetchSkills } from './skills';
import { fetchObjectives } from './objectives';
import { PLACEHOLDER_ITEM_ID } from '../data/content/org/common';
import { configuration } from './utils/config';
import { dismissScopedMessages } from './messages';
import { Scope } from 'types/messages';


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
    type: UPDATE_COURSE_RESOURCES,
    resources,
  });


/**
 * Course changed action builder
 * @param model - course model
 */
export const courseChanged = (model: CourseModel): CourseChangedAction => ({
  type: COURSE_CHANGED,
  model,
});


function createPlaceholderPage(courseId: string) {

  const resource = WorkbookPageModel.createNew(
        PLACEHOLDER_ITEM_ID, 'Placeholder', 'This is a new page with empty content');

  persistence.createDocument(courseId, resource);

  return resource;
}

export function loadCourse(courseId: string) {
  return function (dispatch: any) {

    return persistence.retrieveCoursePackage(courseId)
    .then((document) => {

      // Notify that the course has changed when a user views a course
      if (document.model.modelType === ModelTypes.CourseModel) {

        const courseModel : CourseModel = document.model;

        if (!document.model.resources.toArray().some(
          resource => resource.id === PLACEHOLDER_ITEM_ID)) {

          const placeholder = createPlaceholderPage(courseId);
          const updatedModel = courseModel.with(
            { resources: courseModel.resources.set(PLACEHOLDER_ITEM_ID, placeholder.resource) });

          dispatch(courseChanged(updatedModel));
          dispatch(fetchSkills(courseId));
          dispatch(fetchObjectives(courseId));
          return updatedModel;

        } else {
          dispatch(courseChanged(document.model));
          dispatch(fetchSkills(courseId));
          dispatch(fetchObjectives(courseId));
          return document.model;
        }
      }

    })
    .catch(err => console.log(err));
  };
}

export function viewCourse(courseId: string) {
  return function (dispatch) {
    dispatch(loadCourse(courseId)).then((c) => {

      // This ensures that we wipe any messages displayed from
      // another course
      dispatch(dismissScopedMessages(Scope.Application));
      dispatch(viewDocument(courseId, courseId));
    });
  };
}


