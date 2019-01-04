import { Map } from 'immutable';
import { Maybe } from 'tsmonad';
import { logger, LogTag } from 'utils/logger';

export enum ROUTE {
  ROOT = '',
  RESOURCE = 'resource',
  CREATE = 'create',
  IMPORT = 'import',
  SKILLS = 'skills',
  PAGES = 'pages',
  FORMATIVE = 'formative',
  SUMMATIVE = 'summative',
  POOLS = 'pools',
  ORGANIZATIONS = 'organizations',
  OBJECTIVES = 'objectives',
}

export const getRouteFromPath = (path: string, search: string) => {
  const parseRootPath = (path: string) => {
    if (path && path.startsWith('state')) {
      return '';
    }

    const matches = /^\/?([^\?]*)/.exec(path);
    return matches && matches[1] || '';
  };

  const parseCourseResourceIds = (path: string) => {
    const pathParts = parseRootPath(path).split('-');
    return pathParts.length > 1
      ? {
        resourceId: Maybe.just<string>(pathParts[0]),
        courseId: Maybe.just<string>(pathParts[1]),
      }
      : {
        resourceId: Maybe.nothing<string>(),
        courseId: Maybe.just<string>(pathParts[1]),
      };
  };

  const { route, courseId, resourceId } = (() => {
    switch (parseRootPath(path).split('-')[0]) {
      case '':
        return {
          route: ROUTE.ROOT,
          courseId: Maybe.nothing<string>(),
          resourceId: Maybe.nothing<string>(),
        };
      case 'create':
        return {
          route: ROUTE.CREATE,
          courseId: Maybe.nothing<string>(),
          resourceId: Maybe.nothing<string>(),
        };
      case 'import':
        return {
          route: ROUTE.IMPORT,
          courseId: Maybe.nothing<string>(),
          resourceId: Maybe.nothing<string>(),
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
        return {
          route: ROUTE.RESOURCE,
          ...parseCourseResourceIds(path),
        };
    }
  })();

  const urlParams = search ? search.replace('?', '').split('&').reduce(
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

  return ({
    route,
    path,
    courseId,
    resourceId,
    urlParams,
  });
};

export type UPDATE_ROUTE_ACTION = 'route/UPDATE_ROUTE_ACTION';
export const UPDATE_ROUTE_ACTION: UPDATE_ROUTE_ACTION = 'route/UPDATE_ROUTE_ACTION';

export type UpdateRouteAction = {
  type: UPDATE_ROUTE_ACTION,
  route: ROUTE,
  path: string,
  courseId: Maybe<string>,
  resourceId: Maybe<string>,
  urlParams: Map<string, string>,
};

export const updateRoute = (path: string, search: string): UpdateRouteAction => {
  const {
    route,
    courseId,
    resourceId,
    urlParams,
  } = getRouteFromPath(path, search);

  return ({
    type: UPDATE_ROUTE_ACTION,
    route,
    path,
    courseId,
    resourceId,
    urlParams,
  });
};

export type RESET_ROUTE_ACTION = 'route/RESET_ROUTE_ACTION';
export const RESET_ROUTE_ACTION: RESET_ROUTE_ACTION = 'route/RESET_ROUTE_ACTION';

export type ResetRouteAction = {
  type: RESET_ROUTE_ACTION,
};

export const ResetRouteAction = (): ResetRouteAction => ({
  type: RESET_ROUTE_ACTION,
});
