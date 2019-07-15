import { Skill } from 'data/contentTypes';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';

import { LegacyTypes, CourseIdVers } from 'data/types';

export type SET_SKILLS = 'SET_SKILLS';
export const SET_SKILLS = 'SET_SKILLS';

export type UPDATE_SKILLS = 'UPDATE_SKILLS';
export const UPDATE_SKILLS = 'UPDATE_SKILLS';

export type SetSkillsAction = {
  type: SET_SKILLS,
  skills: Immutable.OrderedMap<string, Skill>,
};

export function setSkills(skills: Immutable.OrderedMap<string, Skill>): SetSkillsAction {
  return {
    type: SET_SKILLS,
    skills,
  };
}

export type UpdateSkillsAction = {
  type: UPDATE_SKILLS,
  skills: Immutable.OrderedMap<string, Skill>,
};

export function updateSkills(skills: Immutable.OrderedMap<string, Skill>): UpdateSkillsAction {
  return {
    type: UPDATE_SKILLS,
    skills,
  };
}

export const fetchSkills = (courseId: CourseIdVers) =>
  (dispatch): Promise<any> => {

    return persistence.bulkFetchDocuments(courseId, [LegacyTypes.skills_model], 'byTypes')
      .then((skills) => {

        // Convert the multiple documents of skills into an
        // array of arrays of key values
        const skillArray = skills
          .map(doc => (doc.model as any).skills.toArray())
          .reduce((p, c) => [...p, ...c], [])
          .map(s => [s.id.value(), s]);

        const map = Immutable.OrderedMap<string, Skill>(skillArray);
        dispatch(setSkills(map));
        return map;
      });
  };


