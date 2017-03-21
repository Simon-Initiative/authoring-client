import * as courseActions from '../actions/course';
import { OtherAction } from './utils';

type CourseActions = 
  courseActions.courseChangedAction |
  OtherAction

type CurrentCourse = {
  courseId: string,
  organizationId: string
}

export function course(state = null, action: CourseActions): CurrentCourse {
  switch(action.type) {
  case courseActions.COURSE_CHANGED:
    return { courseId: action.courseId, organizationId: action.organizationId };
  default:
    return state;
  }
}