import { CourseModel } from 'data/models';
import {
  COURSE_CHANGED, CourseChangedAction, UPDATE_COURSE_RESOURCES,
  UpdateCourseResourcesAction,
} from 'actions/course';

import { OtherAction } from './utils';
import { Maybe } from 'tsmonad';
import { ENTER_APPLICATION_VIEW, EnterApplicationViewAction } from 'actions/router';

type ActionTypes =
  EnterApplicationViewAction
  | CourseChangedAction
  | UpdateCourseResourcesAction
  | OtherAction;

export type CourseState = Maybe<CourseModel>;

const initialState = null;

export const course = (
  state: CourseState = initialState,
  action: ActionTypes,
): CourseState => {
  switch (action.type) {
    case COURSE_CHANGED:
      return Maybe.just(action.model);
    case UPDATE_COURSE_RESOURCES:
      return state.lift(c => c.with({ resources: c.resources.merge(action.resources) }));
    case ENTER_APPLICATION_VIEW:
      return initialState;
    default:
      return state;
  }
};
