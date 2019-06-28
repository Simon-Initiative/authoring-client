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
import { LegacyTypes, CourseIdV } from 'data/types';

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
  return (dispatch: Dispatch<State>, getState: () => State) => {
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
              transitionApplicationView(dispatch);
              break;
            case 'RouteCourse':
              transitionCourseView(route.route, dispatch, getState);
              break;
            case 'RouteKeycloakGarbage':
          }
        },
        // If we get a "keycloak garbage" route, we shouldn't trigger a route update
        nothing: () => undefined,
      });
  };
}

function transitionApplicationView(dispatch) {
  // Release all redux state relevant to a course.
  dispatch(dismissScopedMessages(Scope.Application));
  dispatch(enterApplicationView());
  dispatch(orgActions.releaseOrg());
}

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

function transitionCourseView(
  routeOption: router.RouteCourse, dispatch, getState: () => State) {
  const { course: loadedCourse, router: loadedRoute, user } = getState();
  const { courseId: requestedCourseId, orgId } = routeOption;

  const requestedOrg: Maybe<string> = orgId.caseOf({
    just: _ => orgId,
    nothing: () => getActiveOrgFromLocalStorage(user, requestedCourseId),
  });

  loadedCourse.caseOf({
    nothing: () => routeDifferentCourse(dispatch, requestedCourseId, requestedOrg, routeOption),
    just: (course) => {
      return isDifferentCourse(course.idv, requestedCourseId)
        ? routeDifferentCourse(dispatch, requestedCourseId, requestedOrg, routeOption)
        : isSameOrg(loadedRoute.route, requestedOrg)
          ? routeSameCourseSameOrg(dispatch)
          : routeSameCourseDifferentOrg(
            dispatch, course, requestedCourseId, requestedOrg, routeOption);
    },
  });
}

function routeSameCourseSameOrg(dispatch) {
  dispatch(dismissScopedMessages(Scope.Resource));
}

function routeSameCourseDifferentOrg(
  dispatch, course: models.CourseModel, courseId: CourseIdV,
  org: Maybe<string>, route: router.RouteCourse) {
  org.caseOf({
    just: (org) => {
      dispatch(dismissScopedMessages(Scope.Organization));
      dispatch(orgActions.load(courseId, org));
    },
    nothing: () => history.push(buildUrlFromRoute({
      ...route,
      orgId: Maybe.just(firstOrg(course)),
    })),
  });
}

function routeDifferentCourse(
  dispatch, courseId: CourseIdV, requestedOrg: Maybe<string>,
  route: router.RouteCourse) {
  dispatch(dismissScopedMessages(Scope.PackageDetails));
  dispatch(courseActions.loadCourse(courseId))
    .then((course: models.CourseModel) => {
      requestedOrg.caseOf({
        just: org => dispatch(orgActions.load(courseId, org)),
        // If we have a url without an org, push a new url with the first org
        nothing: () => history.push(buildUrlFromRoute({
          ...route,
          orgId: Maybe.just(firstOrg(course)),
        })),
      });
    });
}

const getActiveOrgFromLocalStorage = (user: UserState, courseId: CourseIdV) =>
  Maybe.maybe(loadFromLocalStorage(ACTIVE_ORG_STORAGE_KEY))
    .bind(coursePrefs =>
      Maybe.maybe(coursePrefs[activeOrgUserKey(user.profile.username, courseId)])
        .lift(activeOrg => activeOrg));

const isDifferentCourse = (id1: CourseIdV, id2: CourseIdV) =>
  id1.eq(id2);

function isSameOrg(route: router.RouteOption, requestedOrgId: Maybe<string>): boolean {
  return requestedOrgId.caseOf({
    just: (requestedOrgId) => {
      // Only course routes store an organization
      if (route.type !== 'RouteCourse') {
        return false;
      }
      return route.orgId.caseOf({
        just: loadedOrg => loadedOrg === requestedOrgId,
        nothing: () => false,
      });
    },
    nothing: () => false,
  });
}

const firstOrg = (course: models.CourseModel) =>
  course.resourcesById.filter(
    r => r.type === LegacyTypes.organization
      && r.resourceState !== ResourceState.DELETED)
    .first().id;

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
      const { path, params } = getState().router;

      const newUrlParams = params.remove(name);
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
