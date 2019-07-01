import { Map } from 'immutable';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { parseUrl, stringifyUrlParams } from 'actions/utils/router';
import history from 'utils/history';
import * as models from 'data/models';
import { dismissScopedMessages } from './messages';
import { Scope } from 'types/messages';
import * as courseActions from 'actions/course';
import * as orgActions from 'actions/orgs';
import { Maybe } from 'tsmonad';
import { loadFromLocalStorage } from 'utils/localstorage';
import { activeOrgUserKey, ACTIVE_ORG_STORAGE_KEY } from './utils/activeOrganization';
import * as router from 'types/router';
import { ResourceState } from 'data/content/resource';
import { UserState } from 'reducers/user';
import { buildUrlFromRoute } from 'actions/view';
import { LegacyTypes, CourseIdVers } from 'data/types';

export type UPDATE_ROUTE_ACTION = 'route/UPDATE_ROUTE_ACTION';
export const UPDATE_ROUTE_ACTION: UPDATE_ROUTE_ACTION = 'route/UPDATE_ROUTE_ACTION';

export type UpdateRouteAction = {
  type: UPDATE_ROUTE_ACTION,
  path: string,
  params: Map<string, string>,
  route: router.RouteOption,
};

/** This function should only be called by history.listen */
export function updateRoute(path: string, search: string) {
  return (dispatch, getState: () => State) => {
    return parseUrl(path, search)
      .caseOf({
        just: (route) => {
          dispatch({
            type: UPDATE_ROUTE_ACTION,
            ...route,
          });

          switch (route.route.type) {
            case 'RouteRoot':
            case 'RouteCreate':
            case 'RouteImport':
            case 'RouteMissing':
              dispatch(dismissScopedMessages(Scope.Application));
              dispatch(enterApplicationView());
              dispatch(orgActions.releaseOrg());
              break;
            case 'RouteCourse':
              const { course: loadedCourse, router: loadedRoute, user } = getState();
              const routeOption = route.route;
              const { courseId: requestedCourseId, orgId } = route.route;

              const isDifferentCourse = (id1, id2) => id1.eq(id2);

              const requestedOrg: Maybe<string> = orgId.caseOf({
                just: _ => orgId,
                nothing: () => getActiveOrgFromLocalStorage(user, requestedCourseId),
              });

              Maybe.maybe(loadedCourse).caseOf({
                nothing: () =>
                  routeDifferentCourse(dispatch, requestedCourseId, requestedOrg, routeOption),
                just: (course) => {
                  if (isDifferentCourse(course.idvers, requestedCourseId)) {
                    return routeDifferentCourse(
                      dispatch, requestedCourseId, requestedOrg, routeOption);
                  }

                  if (isDifferentOrg(loadedRoute.route, requestedOrg)) {
                    return routeDifferentOrg(
                      dispatch, course, requestedCourseId, requestedOrg, routeOption);
                  }
                  return dispatch(dismissScopedMessages(Scope.Resource));
                },
              });
              break;
            case 'RouteKeycloakGarbage':
          }
        },
        // If we get a "keycloak garbage" route, we shouldn't trigger a route update
        nothing: () => undefined,
      });
  };
}


function routeDifferentOrg(
  dispatch, course: models.CourseModel, courseId: CourseIdVers,
  org: Maybe<string>, route: router.RouteCourse) {
  org.caseOf({
    just: (org) => {
      if (course.resourcesById.get(org)) {
        dispatch(dismissScopedMessages(Scope.Organization));
        dispatch(orgActions.load(courseId, org));
      } else {
        history.push(buildUrlFromRoute({
          ...route,
          orgId: Maybe.just(firstOrg(course)),
        }));
      }
    },
    nothing: () => history.push(buildUrlFromRoute({
      ...route,
      orgId: Maybe.just(firstOrg(course)),
    })),
  });
}

function routeDifferentCourse(
  dispatch, courseId: CourseIdVers, requestedOrg: Maybe<string>,
  route: router.RouteCourse) {
  dispatch(dismissScopedMessages(Scope.PackageDetails));
  dispatch(courseActions.loadCourse(courseId))
    .then((course: models.CourseModel) => {
      requestedOrg.caseOf({
        just: (org) => {
          if (course.resourcesById.get(org)) {
            dispatch(orgActions.load(courseId, org));
          } else {
            history.push(buildUrlFromRoute({
              ...route,
              orgId: Maybe.just(firstOrg(course)),
            }));
          }
        },
        // If we have a url without an org, push a new url with the first org
        nothing: () => history.push(buildUrlFromRoute({
          ...route,
          orgId: Maybe.just(firstOrg(course)),
        })),
      });
    });
}


const getActiveOrgFromLocalStorage = (user: UserState, courseId: CourseIdVers) =>
  Maybe.maybe<JSON | undefined>(loadFromLocalStorage(ACTIVE_ORG_STORAGE_KEY))
    .lift<string | undefined>(coursePrefs =>
      coursePrefs[activeOrgUserKey(user.profile.username, courseId)]);

function isDifferentOrg(route: router.RouteOption, requestedOrgId: Maybe<string>): boolean {
  return requestedOrgId.caseOf({
    just: (requestedOrgId) => {
      // Only course routes store an organization
      if (route.type !== 'RouteCourse') {
        return true;
      }
      return route.orgId.caseOf({
        just: loadedOrg => loadedOrg !== requestedOrgId,
        nothing: () => true,
      });
    },
    nothing: () => true,
  });
}

const firstOrg = (course: models.CourseModel) =>
  course.resourcesById.filter(
    r => r.type === LegacyTypes.organization
      && r.resourceState !== ResourceState.DELETED)
    .first().id;

export type ENTER_APPLICATION_VIEW = 'ENTER_APPLICATION_VIEW';
export const ENTER_APPLICATION_VIEW: ENTER_APPLICATION_VIEW = 'ENTER_APPLICATION_VIEW';

export type EnterApplicationViewAction = {
  type: ENTER_APPLICATION_VIEW,
};

export function enterApplicationView(): EnterApplicationViewAction {
  return {
    type: ENTER_APPLICATION_VIEW,
  };
}

export type RESET_ROUTE_ACTION = 'route/RESET_ROUTE_ACTION';
export const RESET_ROUTE_ACTION: RESET_ROUTE_ACTION = 'route/RESET_ROUTE_ACTION';

export type ResetRouteAction = {
  type: RESET_ROUTE_ACTION,
};

export const resetRoute = (): ResetRouteAction => ({
  type: RESET_ROUTE_ACTION,
});


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
      const { path, params } = getState().router;

      const newUrlParams = value
        ? params.set(name, value) : params.remove(name);
      const newSearch = stringifyUrlParams(newUrlParams);

      if (replaceRoute) {
        replace('/' + path + newSearch);
      } else {
        push('/' + path + newSearch);
      }

      return dispatch({
        type: SET_SEARCH_PARAM_ACTION,
        newUrlParams,
      });
    };

export type SET_SEARCH_PARAMS_ACTION = 'route/SET_SEARCH_PARAMS_ACTION';
export const SET_SEARCH_PARAMS_ACTION:
  SET_SEARCH_PARAMS_ACTION = 'route/SET_SEARCH_PARAMS_ACTION';

export type SetSearchParamsAction = {
  type: SET_SEARCH_PARAMS_ACTION,
  newUrlParams: Map<string, string>,
};

export const setSearchParams =
  (newParams: Map<string, string>, replaceRoute: boolean = true) =>
    (dispatch: Dispatch<State>, getState: () => State) => {
      const { path, params } = getState().router;

      const newUrlParams = params.merge(newParams);
      const newSearch = stringifyUrlParams(newUrlParams);

      if (replaceRoute) {
        replace('/' + path + newSearch);
      } else {
        push('/' + path + newSearch);
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
      const { path, params } = getState().router;

      const newUrlParams = params.remove(name);
      const newSearch = stringifyUrlParams(newUrlParams);

      if (replaceRoute) {
        replace('/' + path + newSearch);
      } else {
        push('/' + path + newSearch);
      }

      return dispatch({
        type: CLEAR_SEARCH_PARAM_ACTION,
        newUrlParams,
      });
    };
