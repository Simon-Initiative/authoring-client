import { Map } from 'immutable';

import { SET_SKILLS, SetSkillsAction, UPDATE_SKILLS, UpdateSkillsAction } from 'actions/skills';
import { Skill } from 'data//contentTypes';
import { OtherAction } from './utils';

export type SkillAction = SetSkillsAction | UpdateSkillsAction | OtherAction;
export type SkillState = Map<string, Skill>;

const initialState: SkillState = Map<string, Skill>();

export const skills = (
  state: SkillState = initialState,
  action: SkillAction,
) : SkillState => {
  switch (action.type) {
    case SET_SKILLS:
      return action.skills;
    case UPDATE_SKILLS:
      return state.merge(action.skills);
    default:
      return state;
  }
};
