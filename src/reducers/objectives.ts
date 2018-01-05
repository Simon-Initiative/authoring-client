import { Map } from 'immutable';

import {
  SET_OBJECTIVES, SetObjectivesAction, UPDATE_OBJECTIVES, UpdateObjectivesAction,
} from 'actions/objectives';
import { LearningObjective } from 'data//contentTypes';
import { OtherAction } from './utils';

export type SkillAction = SetObjectivesAction | UpdateObjectivesAction | OtherAction;
export type ObjectiveState = Map<string, LearningObjective>;

const initialState: ObjectiveState = Map<string, LearningObjective>();

export const objectives = (
  state: ObjectiveState = initialState,
  action: SkillAction,
) : ObjectiveState => {
  switch (action.type) {
    case SET_OBJECTIVES:
      return action.objectives;
    case UPDATE_OBJECTIVES:
      return state.merge(action.objectives);
    default:
      return state;
  }
};
