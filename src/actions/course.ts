import * as persistence from 'app/data/persistence';
import { CourseModel } from 'app/data/models';
import { LegacyTypes } from 'app/data/types';
import { Skill, Title } from 'app/types/course';
import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { configuration } from './utils/config';

export type COURSE_CHANGED = 'course/COURSE_CHANGED';
export const COURSE_CHANGED: COURSE_CHANGED = 'course/COURSE_CHANGED';

export type CourseChangedAction = {
  type: COURSE_CHANGED,
  model: CourseModel,
};

/**
 * Course changed action builder
 * @param model - course model
 */
export const courseChanged = (model: CourseModel): CourseChangedAction => ({
  type: COURSE_CHANGED,
  model,
});

export type RECEIVE_TITLES = 'course/RECEIVE_TITLES';
export const RECEIVE_TITLES: RECEIVE_TITLES = 'course/RECEIVE_TITLES';

export type ReceiveTitlesAction = {
  type: RECEIVE_TITLES,
  titles: Title[],
};

/**
 * Receive titles action builder
 * @param titles - titles received
 */
export const receiveTitles = (titles: Title[]): ReceiveTitlesAction => ({
  type: RECEIVE_TITLES,
  titles,
});

/**
 * Returns a Promise to fetch the title with the given id.
 * Dispatches ReceiveTitlesAction on success.
 * @param courseId - id of the course
 * @param id - id of the title
 */
export const fetchTitle = (courseId: string, id: string) => (
  (dispatch, getState): Promise<any> => {
    return persistence.retrieveDocument(courseId, id)
      .then((doc) => {
        if (doc.model.modelType === 'AssessmentModel') {
          const title = doc.model.title.text;
          dispatch(receiveTitles([{ id, title }]));
          return title;
        }
      });
  }
);

/**
 * Returns a Promise to fetch skill titles of the course with the given id.
 * Dispatches ReceiveTitlesAction on success.
 * @param courseId - id of the course
 */
export const fetchSkillTitles = (courseId: string) => (
  (dispatch, getState): Promise<Skill[]> => {
    return persistence.bulkFetchDocuments(courseId, [LegacyTypes.skills_model], 'byTypes')
      .then ((skills) => {
        const titles: Title[] = skills
          .map(doc => (doc.model as any).skills.toArray())
          .reduce((p, c) => [...p, ...c]);

        dispatch(receiveTitles(titles));
        return titles as Skill[];
      });
  }
);

/**
 * Returns a Promise to fetch objective titles of the course with the given id.
 * Dispatches ReceiveTitlesAction on success.
 * @param courseId - id of the course
 */
export const fetchObjectiveTitles = (courseId: string) => (
  (dispatch, getState): Promise<any> => {
    return persistence.bulkFetchDocuments(courseId, [LegacyTypes.learning_objectives], 'byTypes')
      .then ((objectives) => {
        const titles: Title[] = objectives
          .map(doc => (doc.model as any).objectives.toArray())
          .reduce((p, c) => [...p, ...c]);

        dispatch(receiveTitles(titles));
        return titles;
      });
  }
);

/**
 * Returns a Promise to get the title with the given id.
 * Dispatches ReceiveTitlesAction on success.
 * @param courseId - id of the course
 * @param id - id of the title
 * @param type - type of title
 */
export const getTitle = (courseId: string, id: string, type: string) => (
  (dispatch, getState): Promise<any> => {
    switch (type) {
      case 'skill':
        return dispatch(fetchSkillTitles(courseId))
          .then(titles => titles.find(t => t.id === id));
      case 'objective':
      case LegacyTypes.learning_objectives:
        return dispatch(fetchObjectiveTitles(courseId))
          .then(titles => titles.find(t => t.id === id));
      default:
        return dispatch(fetchTitle(courseId, id));
    }
  }
);

/**
 * Returns a Promise to get all titles with the given ids.
 * Dispatches ReceiveTitlesAction on success.
 * @param courseId - id of the course
 * @param ids - list of title ids
 * @param type - type of titles
 */
export const getTitles = (courseId: string, ids: string[], type: string) => (
  (dispatch, getState): Promise<any> => {
    switch (type) {
      case 'skill':
        return dispatch(fetchSkillTitles(courseId))
          .then(titles => titles.filter(t => ids.find(id => id === t.id)).map(t => t.title));
      case 'objective':
      case LegacyTypes.learning_objectives:
        return dispatch(fetchObjectiveTitles(courseId))
          .then(titles => titles.filter(t => ids.find(id => id === t.id)).map(t => t.title));
      default:
        return new Promise((resolve, reject) => reject('must specify a valid title type'));
    }
  }
);
