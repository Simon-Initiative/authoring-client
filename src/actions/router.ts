import { Map } from 'immutable';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { parseUrl, stringifyUrlParams, RouteInfo } from 'actions/utils/router';
import history from 'utils/history';
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
import { LegacyTypes, CourseIdVers, ResourceId } from 'data/types';
import { CourseModel } from 'data/models/course';

export type UPDATE_ROUTE_ACTION = 'route/UPDATE_ROUTE_ACTION';
export const UPDATE_ROUTE_ACTION: UPDATE_ROUTE_ACTION = 'route/UPDATE_ROUTE_ACTION';

type Transition = 'Application' | 'Course' | 'Organization' | 'Resource' | 'Other';

export type UpdateRouteAction = {
  type: UPDATE_ROUTE_ACTION,
  path: string,
  params: Map<string, string>,
  route: router.RouteOption,
};

/** This function should only be called by history.listen */
export function updateRoute(path: string, search: string) {
  return async (dispatch, getState: () => State) => {
    const { course: courseInRedux, orgs: orgsInRedux, user, router: oldRoute } = getState();

    const newRoute = await parseUrl(path, search);

    const requestedCourse = newRoute.route.type === 'RouteCourse' && newRoute.route.courseId;
    const isSameCourse = courseInRedux && courseInRedux.idvers.eq(requestedCourse);

    determineTransition(newRoute)
      .then(dismissMessages);

    loadResources(newRoute)
      .then(route => updateUrlIfNecessary(route, newRoute))
      .then(route => dispatch({
        type: UPDATE_ROUTE_ACTION,
        ...route,
      }));

    async function determineTransition(route: RouteInfo): Promise<Transition> {
      switch (route.route.type) {
        case 'RouteRoot':
        case 'RouteCreate':
        case 'RouteImport':
        case 'RouteMissing':
          return 'Application';
        case 'RouteCourse':
          const routeOption = route.route;
          const { orgId: requestedOrg } = routeOption;

          if (!isSameCourse) {
            return 'Course';
          }

          return requestedOrg.caseOf({
            just: org => orgsInRedux.activeOrg.caseOf({
              just: activeOrg => org.eq(activeOrg._id) ? 'Resource' : 'Organization',
              nothing: () => 'Organization',
            }),
            nothing: () => orgsInRedux.activeOrg.caseOf({
              just: _ => 'Resource',
              nothing: () => 'Organization',
            }),
          }) as Transition;
      }
    }

    async function dismissMessages(transition: Transition) {
      return dispatch(dismissScopedMessages((() => {
        switch (transition) {
          case 'Application': return Scope.Application;
          case 'Course': return Scope.CoursePackage;
          case 'Organization': return Scope.Organization;
          case 'Resource': return Scope.Resource;
        }
      })()));
    }

    async function loadResources(route: RouteInfo): Promise<RouteInfo> {
      switch (route.route.type) {

        // "Application" routes
        case 'RouteRoot':
        case 'RouteCreate':
        case 'RouteImport':
        case 'RouteMissing':
          dispatch(enterApplicationView());
          dispatch(orgActions.releaseOrg());
          return Promise.resolve(route);

        case 'RouteCourse':
          const routeOption = route.route;
          const { courseId: requestedCourse, orgId: requestedOrg } = routeOption;

          // Course priorities:
          // 1. Use the current course
          // 2. Load a new course
          const course = isSameCourse
            ? courseInRedux
            : await dispatch(courseActions.loadCourse(requestedCourse));
          // Org priorities:
          // 1. Use the org requested in the route
          // 2. Use the org saved in local storage
          // 3. Use the loaded course's first org
          const getFirstOrg = (course: CourseModel) => course.resourcesById.filter(
            r => r.type === LegacyTypes.organization
              && r.resourceState !== ResourceState.DELETED)
            .first().id as ResourceId;

          const getOrgFromLocalStorage = (user: UserState, courseId: CourseIdVers) =>
            Maybe.maybe(loadFromLocalStorage(ACTIVE_ORG_STORAGE_KEY))
              .lift(savedOrgs => savedOrgs[activeOrgUserKey(user.profile.username, courseId)])
              .lift((activeOrg: string) => ResourceId.of(activeOrg) as ResourceId);

          const organization = requestedOrg
            .valueOr(getOrgFromLocalStorage(user, requestedCourse)
              .valueOr(getFirstOrg(course)));

          const isSameOrg = orgsInRedux.activeOrg.caseOf({
            just: org => {
              return org._id.eq(organization)
            },
            nothing: () => false,
          });

          if (!isSameOrg) {
            dispatch(orgActions.releaseOrg());
            dispatch(orgActions.load(course.idvers, organization));
          }

          // If the route is coming from the URL (via history.listen) and not a route transition,
          // a request to view an org component may be incorrectly parsed as a 'RouteResource'
          // because it shares the same path as a 'RouteOrgComponent'.
          // Now that we have the course loaded, we can check if the resource belongs to
          // the course. If it doesn't, that indicates that we want to view an org component.
          if (routeOption.route.type === 'RouteResource') {
            const resourceId = routeOption.route.id;
            if (!course.resourcesById.get(resourceId.value())) {
              return Promise.resolve({
                ...route,
                route: router.toRouteCourse(
                  course.idvers,
                  Maybe.just(organization),
                  router.toRouteOrgComponent(resourceId.value())),
              });
            }
          }
          return Promise.resolve({
            ...route,
            route: router.toRouteCourse(course.idvers, Maybe.just(organization), routeOption.route),
          });
      }
    }

    async function updateUrlIfNecessary(
      updatedRoute: RouteInfo, urlRoute: RouteInfo): Promise<RouteInfo> {
      // At the moment, the only time we need to update the URL is if an organization
      // is missing from the URL.

      const isOrgMissingFromRoute = updatedRoute.route.type === 'RouteCourse'
        && urlRoute.route.type === 'RouteCourse'
        && !updatedRoute.route.orgId.equals(urlRoute.route.orgId);

      if (isOrgMissingFromRoute) {
        history.replace(buildUrlFromRoute(updatedRoute.route));
      }

      return {
        params: urlRoute.params,
        ...updatedRoute,
      };
    }
  };
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
