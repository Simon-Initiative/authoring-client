import * as courseActions from "../actions/course";
import * as models from '../data/models';
import {OtherAction} from "./utils";

type CourseActions =
    courseActions.courseChangedAction |
    OtherAction

type CurrentCourse = {
  model: models.CourseModel,
};

export function course(state = null, action: CourseActions): CurrentCourse {
    switch (action.type) {
        case courseActions.COURSE_CHANGED:
            return {
                model: action.model
            };
        default:
            return state;
    }
}
