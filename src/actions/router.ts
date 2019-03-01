import { Map } from 'immutable';
import { Maybe } from 'tsmonad';
import { logger, LogTag } from 'utils/logger';
import history from 'utils/history';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';

export enum ROUTE {
  ROOT = '',
  RESOURCE = 'resource',
  CREATE = 'create',
  IMPORT = 'import',
  PREVIEW = 'preview',
  SKILLS = 'skills',
  PAGES = 'pages',
  FORMATIVE = 'formative',
  SUMMATIVE = 'summative',
  FEEDBACK = 'feedbackassessments',
  POOLS = 'pools',
  ORGANIZATIONS = 'organizations',
  OBJECTIVES = 'objectives',
}

export const getUrlParams = (search: string): Map<string, string> =>
  search ? search.replace('?', '').split('&').reduce(
    (acc, val) => {
      const [param, value] = val.split('=');
      if (!param || !value) {
        logger.error(LogTag.EDITOR, 'Unable to parse parameter: ' + val);
        return acc;
      }

      return acc.set(param, value);
    },
    Map<string, string>(),
  )
    : Map<string, string>();

export const stringifyUrlParams = (urlParams: Map<string, string>): string =>
  urlParams.keySeq().reduce(
    (acc, name, index) => {
      return `${acc}${index > 0 ? '&' : ''}${name}=${urlParams.get(name)}`;
    },
    '?',
  );

export const getRouteFromPath = (path: string, search: string) => {
  const parseRootPath = (path: string) => {
    const matches = /^\/?([^\?]*)/.exec(path);
    return matches && matches[1] || '';
  };

  const parseCourseResourceIds = (path: string) => {
    const pathParts = parseRootPath(path).split('-');
    return {
      resourceId: Maybe.maybe<string>(pathParts[0]),
      courseId: Maybe.maybe<string>(pathParts[1]),
      orgId: Maybe.maybe<string>(pathParts[2]),
    };
  };

  const { route, courseId, resourceId, orgId } = (() => {
    switch (parseRootPath(path).split('-')[0]) {
      case '':
        return {
          route: ROUTE.ROOT,
          resourceId: Maybe.nothing<string>(),
          courseId: Maybe.nothing<string>(),
          orgId: Maybe.nothing<string>(),
        };
      case 'create':
        return {
          route: ROUTE.CREATE,
          resourceId: Maybe.nothing<string>(),
          courseId: Maybe.nothing<string>(),
          orgId: Maybe.nothing<string>(),
        };
      case 'import':
        return {
          route: ROUTE.IMPORT,
          resourceId: Maybe.nothing<string>(),
          courseId: Maybe.nothing<string>(),
          orgId: Maybe.nothing<string>(),
        };
      case 'skills':
        return {
          route: ROUTE.SKILLS,
          ...parseCourseResourceIds(path),
        };
      case 'pages':
        return {
          route: ROUTE.PAGES,
          ...parseCourseResourceIds(path),
        };
      case 'formativeassessments':
        return {
          route: ROUTE.FORMATIVE,
          ...parseCourseResourceIds(path),
        };
      case 'summativeassessments':
        return {
          route: ROUTE.SUMMATIVE,
          ...parseCourseResourceIds(path),
        };
      case 'feedbackassessments':
        return {
          route: ROUTE.FEEDBACK,
          ...parseCourseResourceIds(path),
        };
      case 'pools':
        return {
          route: ROUTE.POOLS,
          ...parseCourseResourceIds(path),
        };
      case 'organizations':
        return {
          route: ROUTE.ORGANIZATIONS,
          ...parseCourseResourceIds(path),
        };
      case 'objectives':
        return {
          route: ROUTE.OBJECTIVES,
          ...parseCourseResourceIds(path),
        };
      default:
        if (path.startsWith('preview')) {
          return {
            route: ROUTE.PREVIEW,
            ...parseCourseResourceIds(path.replace(/^preview/, '')),
          };
        }

        return {
          route: ROUTE.RESOURCE,
          ...parseCourseResourceIds(path),
        };
    }
  })();

  const urlParams = getUrlParams(search);

  return ({
    route,
    courseId,
    resourceId,
    orgId,
    urlParams,
  });
};

export type UPDATE_ROUTE_ACTION = 'route/UPDATE_ROUTE_ACTION';
export const UPDATE_ROUTE_ACTION: UPDATE_ROUTE_ACTION = 'route/UPDATE_ROUTE_ACTION';

export type UpdateRouteAction = {
  type: UPDATE_ROUTE_ACTION,
  route: ROUTE,
  path: string,
  search: string,
  courseId: Maybe<string>,
  resourceId: Maybe<string>,
  orgId: Maybe<string>,
  urlParams: Map<string, string>,
};

/** This function should only be called by history.listen */
export const updateRoute = (path: string, search: string): UpdateRouteAction => {
  const {
    route,
    courseId,
    resourceId,
    orgId,
    urlParams,
  } = getRouteFromPath(path, search);

  return ({
    type: UPDATE_ROUTE_ACTION,
    route,
    path,
    search,
    courseId,
    resourceId,
    orgId,
    urlParams,
  });
};

export type PUSH_ROUTE_ACTION = 'route/PUSH_ROUTE_ACTION';
export const PUSH_ROUTE_ACTION: PUSH_ROUTE_ACTION = 'route/PUSH_ROUTE_ACTION';

export type PushAction = {
  type: PUSH_ROUTE_ACTION,
  path: string,
  state?: any,
};

export const push = (path: string, state?: any): PushAction => {
  history.push(path, state);

  return {
    type: PUSH_ROUTE_ACTION,
    path,
    state,
  };
};

export type REPLACE_ACTION = 'route/REPLACE_ACTION';
export const REPLACE_ACTION: REPLACE_ACTION = 'route/REPLACE_ACTION';

export type ReplaceRouteAction = {
  type: REPLACE_ACTION,
  path: string,
  state?: any,
};

export const replace = (path: string, state?: any): ReplaceRouteAction => {
  history.replace(path, state);

  return {
    type: REPLACE_ACTION,
    path,
    state,
  };
};

export type SET_SEARCH_PARAM_ACTION = 'route/SET_SEARCH_PARAM_ACTION';
export const SET_SEARCH_PARAM_ACTION: SET_SEARCH_PARAM_ACTION = 'route/SET_SEARCH_PARAM_ACTION';

export type SetSearchParamAction = {
  type: SET_SEARCH_PARAM_ACTION,
  newUrlParams: Map<string, string>,
};

export const setSearchParam =
  (name: string, value: string, replaceRoute: boolean = true) =>
    (dispatch: Dispatch<State>, getState: () => State) => {
      const { path, urlParams } = getState().router;

      const newUrlParams = value
        ? urlParams.set(name, value) : urlParams.remove(name);
      const newSearch = stringifyUrlParams(newUrlParams);

      if (replaceRoute) {
        replace(path + newSearch);
      } else {
        push(path + newSearch);
      }

      return dispatch({
        type: SET_SEARCH_PARAM_ACTION,
        newUrlParams,
      });
    };

export type SET_SEARCH_PARAMS_ACTION = 'route/SET_SEARCH_PARAMS_ACTION';
export const SET_SEARCH_PARAMS_ACTION: SET_SEARCH_PARAMS_ACTION = 'route/SET_SEARCH_PARAMS_ACTION';

export type SetSearchParamsAction = {
  type: SET_SEARCH_PARAMS_ACTION,
  newUrlParams: Map<string, string>,
};

export const setSearchParams =
  (params: Map<string, string>, replaceRoute: boolean = true) =>
    (dispatch: Dispatch<State>, getState: () => State) => {
      const { path, urlParams } = getState().router;

      const newUrlParams = urlParams.merge(params);
      const newSearch = stringifyUrlParams(newUrlParams);

      if (replaceRoute) {
        replace(path + newSearch);
      } else {
        push(path + newSearch);
      }

      return dispatch({
        type: SET_SEARCH_PARAM_ACTION,
        newUrlParams,
      });
    };

export type CLEAR_SEARCH_PARAM_ACTION = 'route/CLEAR_SEARCH_PARAM_ACTION';
export const CLEAR_SEARCH_PARAM_ACTION:
  CLEAR_SEARCH_PARAM_ACTION = 'route/CLEAR_SEARCH_PARAM_ACTION';

export type ClearSearchParamAction = {
  type: CLEAR_SEARCH_PARAM_ACTION,
  newUrlParams: Map<string, string>,
};

export const clearSearchParam =
  (name: string, replaceRoute: boolean = true) =>
    (dispatch: Dispatch<State>, getState: () => State) => {
      const { path, urlParams } = getState().router;

      const newUrlParams = urlParams.remove(name);
      const newSearch = stringifyUrlParams(newUrlParams);

      if (replaceRoute) {
        replace(path + newSearch);
      } else {
        push(path + newSearch);
      }

      return dispatch({
        type: CLEAR_SEARCH_PARAM_ACTION,
        newUrlParams,
      });
    };

export type RESET_ROUTE_ACTION = 'route/RESET_ROUTE_ACTION';
export const RESET_ROUTE_ACTION: RESET_ROUTE_ACTION = 'route/RESET_ROUTE_ACTION';

export type ResetRouteAction = {
  type: RESET_ROUTE_ACTION,
};

export const resetRoute = (): ResetRouteAction => ({
  type: RESET_ROUTE_ACTION,
});
