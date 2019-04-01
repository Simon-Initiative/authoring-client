import { LearningObjective } from 'data/contentTypes';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';

import { LegacyTypes } from 'data/types';

export type SET_OBJECTIVES = 'SET_OBJECTIVES';
export const SET_OBJECTIVES = 'SET_OBJECTIVES';

export type UPDATE_OBJECTIVES = 'UPDATE_OBJECTIVES';
export const UPDATE_OBJECTIVES = 'UPDATE_OBJECTIVES';

export type SetObjectivesAction = {
  type: SET_OBJECTIVES,
  objectives: Immutable.OrderedMap<string, LearningObjective>,
};

export function setObjectives(
  objectives: Immutable.OrderedMap<string, LearningObjective>): SetObjectivesAction {
  return {
    type: SET_OBJECTIVES,
    objectives,
  };
}

export type UpdateObjectivesAction = {
  type: UPDATE_OBJECTIVES,
  objectives: Immutable.OrderedMap<string, LearningObjective>,
};

export function updateObjectives(
  objectives: Immutable.OrderedMap<string, LearningObjective>): UpdateObjectivesAction {
  return {
    type: UPDATE_OBJECTIVES,
    objectives,
  };
}

export const fetchObjectives = (courseId: string) =>
  (dispatch): Promise<any> => {

    return persistence.bulkFetchDocuments(courseId, [LegacyTypes.learning_objectives], 'byTypes')
      .then((objectives) => {

        // Convert the multiple documents of objs into an
        // array of arrays of key values
        const arr = objectives
          .map(doc => (doc.model as any).objectives.toArray())
          .reduce((p, c) => [...p, ...c], [])
          .map(s => [s.id, s]);

        const map = Immutable.OrderedMap<string, LearningObjective>(arr);
        dispatch(setObjectives(map));
        return map;
      });
  };


