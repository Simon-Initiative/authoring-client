import * as persistence from 'data/persistence';
import { CourseModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { Skill, Title } from 'types/course';
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

export type UPDATE_TITLES = 'course/UPDATE_TITLES';
export const UPDATE_TITLES: UPDATE_TITLES = 'course/UPDATE_TITLES';

export type UpdateTitlesAction = {
  type: UPDATE_TITLES,
  titles: Title[],
};

/**
 * Receive titles action builder
 * @param titles - titles received
 */
export const updateTitles = (titles: Title[]): UpdateTitlesAction => ({
  type: UPDATE_TITLES,
  titles,
});

export type REMOVE_TITLES = 'course/REMOVE_TITLES';
export const REMOVE_TITLES: REMOVE_TITLES = 'course/REMOVE_TITLES';

export type RemoveTitlesAction = {
  type: REMOVE_TITLES,
  titles: string[],
};

/**
 * Receive titles action builder
 * @param titles - titles received
 */
export const removeTitles = (titles: string[]): RemoveTitlesAction => ({
  type: REMOVE_TITLES,
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
          .reduce((p, c) => [...p, ...c], [])
          .map(s => s.toJS());

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
          .reduce((p, c) => [...p, ...c], [])
          .map(s => s.toJS());

        dispatch(receiveTitles(titles));
        return titles;
      });
  }
);

/**
 * Returns a Promise to get the title with the given id. If the title has been previously loaded,
 * a cached version will be returned. Dispatches ReceiveTitlesAction for a new title on success.
 * @param courseId - id of the course
 * @param id - id of the title
 * @param type - type of title
 */
export const getTitle = (courseId: string, id: string, type: string) => (
  (dispatch, getState): Promise<any> => {
    // if the title has already been loaded, just use the cached title
    const cachedTitle = getState().titles.get(id);
    if (cachedTitle) return Promise.resolve(cachedTitle);

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
 * Returns a Promise to get all titles with the given ids. If a title has been previously loaded,
 * a cached version will be returned. Dispatches ReceiveTitlesAction for the new titles on success.
 * @param courseId - id of the course
 * @param ids - list of title ids
 * @param type - type of titles
 */
export const getTitles = (courseId: string, ids: string[], type: string) => (
  (dispatch, getState): Promise<any> => {
    // if all titles have already been loaded, just use the cached titles
    const cachedTitles = ids.map(id => getState().titles.get(id)).filter(title => title);
    if (cachedTitles.length === ids.length) {
      return Promise.resolve(cachedTitles);
    }

    switch (type) {
      case 'skill':
        return dispatch(fetchSkillTitles(courseId))
          .then(titles => titles.filter(t => ids.find(id => id === t.id)).map(t => t.title));
      case 'objective':
      case LegacyTypes.learning_objectives:
        return dispatch(fetchObjectiveTitles(courseId))
          .then(titles => titles.filter(t => ids.find(id => id === t.id)).map(t => t.title));
      default:
        return Promise.reject('must specify a valid title type');
    }
  }
);

/**
 * Returns a Promise to get all titles with the given ids. If a title has been previously loaded,
 * a cached version will be returned. Dispatches ReceiveTitlesAction for the new titles on success.
 * @param courseId - id of the course
 * @param ids - list of title ids
 * @param type - type of titles
 */
export const getTitlesByModel = (model: CourseModel) => (
  (dispatch, getState): Promise<any> => {

    const courseId = model.get('guid');
    const resources = model.get('resourcesById').toJS();
    const fetchTitlesPromises = Object.keys(resources).map((key) => {
      switch (resources[key].type) {
        case LegacyTypes.skills_model:
          return dispatch(fetchSkillTitles(courseId));
        case LegacyTypes.learning_objectives:
          return dispatch(fetchObjectiveTitles(courseId));
        default:
          return dispatch(receiveTitles([{ id: key, title: resources[key].title }]));
      }
    });

    return Promise.all(fetchTitlesPromises);
  }
);
