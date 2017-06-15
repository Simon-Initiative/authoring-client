import * as courseActions from '../actions/course';
import * as models from '../data/models';
import { OtherAction } from './utils';
import { TitleOracle, CachingTitleOracle } from '../editors/common/TitleOracle';

type CourseActions =
    courseActions.courseChangedAction |
    OtherAction;


export function titles(state = null, action: CourseActions): TitleOracle {
  switch (action.type) {
    case courseActions.COURSE_CHANGED:
      return new CachingTitleOracle(action.model.guid);
    default:
      return state;
  }
}
