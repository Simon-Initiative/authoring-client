import { Map } from 'immutable';
import { Maybe } from 'tsmonad';
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
type CourseState = Maybe<CourseModel>;

const initialState = Maybe.nothing<CourseModel>();

export const course = (
  state: CourseState = initialState,
  action: ActionTypes,
): CourseState => {
  switch (action.type) {
    case COURSE_CHANGED:
      return Maybe.just(action.model);
    case UPDATE_COURSE_RESOURCES:
      return state.caseOf({
        just: m => Maybe.just(m.with({ resources: m.resources.merge(action.resources) })),
        nothing: () => Maybe.nothing<CourseModel>(),
      });
    default:
      return state;
  }
};
