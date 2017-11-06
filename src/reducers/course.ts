import { Map } from 'immutable';
import { Maybe } from 'tsmonad';
import {
  CourseModel,
} from 'data/models';
import {
  CourseChangedAction,
  COURSE_CHANGED,
} from 'actions/course';
import { OtherAction } from './utils';

type ActionTypes = CourseChangedAction | OtherAction;
type CourseState = Map<any, any>;

const initialState: CourseState = Map({
  model: Maybe.nothing<CourseModel>(),
});

export const course = (
  state: CourseState = initialState,
  action: ActionTypes,
): CourseState => {
  switch (action.type) {
    case COURSE_CHANGED:
      return state.set(
        'model',
        action.model ? Maybe.just(action.model) : Maybe.nothing<CourseModel>(),
      );
    default:
      return state;
  }
};
