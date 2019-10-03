import { CourseModel } from 'data/models';
import {
  COURSE_CHANGED, CourseChangedAction, UPDATE_COURSE_RESOURCES,
  UpdateCourseResourcesAction,
} from 'actions/course';

import { OtherAction } from './utils';
import { ENTER_APPLICATION_VIEW, EnterApplicationViewAction } from 'actions/router';

type ActionTypes =
  EnterApplicationViewAction
  | CourseChangedAction
  | UpdateCourseResourcesAction
  | OtherAction;

export type CourseState = CourseModel;

const initialState = null;

export const course = (
  state: CourseState = initialState,
  action: ActionTypes,
): CourseState => {
  switch (action.type) {
    case COURSE_CHANGED:
      return action.model;
    case UPDATE_COURSE_RESOURCES:
      console.log('new resources', action.resources)
      return state.with({ resources: state.resources.merge(action.resources) });
    case ENTER_APPLICATION_VIEW:
      return initialState;
    default:
      return state;
  }
};
