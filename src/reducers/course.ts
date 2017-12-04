import { Map } from 'immutable';
import {
  CourseModel,
} from 'data/models';
import {
  CourseChangedAction,
  COURSE_CHANGED,
  UpdateCourseResourcesAction,
  UPDATE_COURSE_RESOURCES,
} from 'actions/course';
import { OtherAction } from './utils';

type ActionTypes = CourseChangedAction | UpdateCourseResourcesAction | OtherAction;
type CourseState = CourseModel;

const initialState = null;

export const course = (
  state: CourseState = initialState,
  action: ActionTypes,
): CourseState => {
  switch (action.type) {
    case COURSE_CHANGED:
      return action.model;
    case UPDATE_COURSE_RESOURCES:
      return state.with({ resources: state.resources.merge(action.resources) });
    default:
      return state;
  }
};
