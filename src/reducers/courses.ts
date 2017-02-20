import { user } from '../actions/user';
import { OtherAction } from './utils';

type CoursesAction = 
  user.loginSuccessAction |
  OtherAction

export function courses(state : string[] = [], action: CoursesAction) {
  switch (action.type) {
  case user.LOGIN_SUCCESS:
    return [...action.availableCourses];
  default:
    return state;
  }
}
