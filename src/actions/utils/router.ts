import { Map } from 'immutable';
import { Maybe, maybe } from 'tsmonad';
import { logger, LogTag } from 'utils/logger';
import * as routerTypes from 'types/router';
import { CourseIdVers, ResourceId } from 'data/types';


export function parseUrl(url: string, search: string):
  Maybe<{ path: string, params: Map<string, string>, route: routerTypes.RouteOption }> {
  return Maybe.maybe(cleanUrl(url).caseOf({
    // If we have a keycloak garbage url, return no path
    nothing: () => undefined,
    just: (path) => {
      const params = parseUrlParams(search);

      return {
        path,
        params,
        route: parseRoute(path, params).caseOf({
          just: currentRoute => currentRoute,
          nothing: () => routerTypes.toRouteMissing(),
        }),
      };
    },
  }));
}


// Match the root path (no query parameters) after the '/#'
function cleanUrl(url: string): Maybe<string> {
  // Parsed path will be in matches[1]. matches[0] contains a '/' prefix
  const matches = /^\/?([^\?]*)/.exec(url);

  // Root route
  if (!matches || !matches[1]) {
    return Maybe.just('');
  }

  // handle special case where keycloak redirect contains garbage metadata &state
  if (matches[1].startsWith('&state')) {
    return Maybe.nothing();
  }

  return Maybe.just(matches[1]);
}

export const parseUrlParams = (search: string): Map<string, string> =>
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


function parseRoute(
  path: string, params: Map<string, string>): Maybe<routerTypes.RouteOption> {


  const routeParts = path.split('/');
  switch (routeParts[0]) {

    // Application routes
    case '': return maybe(routerTypes.toRouteRoot());
    case 'create': return maybe(routerTypes.toRouteCreate());
    case 'import': return maybe(routerTypes.toRouteImport());

    // Todo: this is not type-safe

    // Course routes
    default: {
      // If it's a course route, routeParts[0] should be courseId-courseVersion
      const idVers = routeParts[0];
      const version = idVers.slice(idVers.lastIndexOf('-') + 1);
      const id = idVers.slice(0, idVers.lastIndexOf('-'));
      if (!id || !version) {
        return Maybe.nothing();
      }
      const parsed = version.split('.').map(s => parseInt(s, 10));
      if ((parsed.length === 2 || parsed.length === 3)
        && parsed.find(isNaN) === undefined) {
        return maybe(routerTypes.toRouteCourse(
          CourseIdVers.of(id, version),
          maybe(params.get('organization')).lift(org => ResourceId.of(org)),
          parseCoursePage(routeParts[1]),
        ));
      }
      return Maybe.nothing();
    }
  }
}

function parseCoursePage(page: string): routerTypes.RouteCourseOption {
  switch (page) {
    case '':
    case undefined: return routerTypes.toRouteCourseOverview();
    case 'skills': return routerTypes.toRouteSkills();
    case 'resources': return routerTypes.toRouteAllResources();
    case 'organizations': return routerTypes.toRouteOrganizations();
    case 'objectives': return routerTypes.toRouteObjectives();
    case 'preview': return routerTypes.toRoutePreview();
    default: return routerTypes.toRouteResource(ResourceId.of(page));
  }
}

// Used for testing
export const stringifyUrlParams = (urlParams: Map<string, string>): string =>
  urlParams.keySeq().reduce(
    (acc, name, index) => {
      return `${acc}${index > 0 ? '&' : ''}${name}=${urlParams.get(name)}`;
    },
    '?',
  );
