import { Maybe } from 'tsmonad';
import { Map } from 'immutable';
import { ResourceId, CourseIdentifier, CourseGuid, ResourceGuid } from 'data/types';


// Only used by the URL parser to build a "real" Route. Never stored in redux
export type LegacyRouteCourse = {
  type: 'LegacyRouteCourse',
  course: CourseGuid,
  organization: Maybe<ResourceGuid>,
  route: RouteOption,
  resource: Maybe<ResourceGuid | ResourceId>,
};

export type RouteOption =
  | RouteApplicationOption
  | RouteCourse;

export type RouteApplicationOption =
  | RouteRoot
  | RouteCreate
  | RouteImport
  | RouteMissing
  | RouteKeycloakGarbage;

export type RouteCourse = {
  type: 'RouteCourse',
  course: CourseIdentifier,
  organization: Maybe<ResourceId>,
  route: RouteCourseOption,
};

export type RouteCourseOption =
  | RouteCourseOverview
  | RouteResource
  | RoutePreview
  | RouteSkills
  | RouteAllResources
  | RouteOrganizations
  | RouteObjectives;

export function toRouteCourse(course: CourseIdentifier,
  organization: Maybe<ResourceId>, route: RouteCourseOption): RouteCourse {
  return {
    type: 'RouteCourse',
    course,
    organization,
    route,
  };
}

export type RouteRoot = { type: 'RouteRoot' };
export function toRouteRoot(): RouteRoot { return { type: 'RouteRoot' }; }

export type RouteCreate = { type: 'RouteCreate' };
export function toRouteCreate(): RouteCreate { return { type: 'RouteCreate' }; }

export type RouteImport = { type: 'RouteImport' };
export function toRouteImport(): RouteImport { return { type: 'RouteImport' }; }

export type RouteCourseOverview = { type: 'RouteCourseOverview' };
export function toRouteCourseOverview():
  RouteCourseOverview { return { type: 'RouteCourseOverview' }; }

export type RouteResource = { type: 'RouteResource', resource: ResourceId };
export function toRouteResource(resource: ResourceId):
  RouteResource { return { type: 'RouteResource', resource }; }

export type RoutePreview = { type: 'RoutePreview', resource: ResourceId };
export function toRoutePreview(resource: ResourceId):
  RoutePreview { return { type: 'RoutePreview', resource }; }

export type RouteSkills = { type: 'RouteSkills' };
export function toRouteSkills(): RouteSkills { return { type: 'RouteSkills' }; }

export type RouteAllResources = { type: 'RouteAllResources' };
export function toRouteAllResources(): RouteAllResources { return { type: 'RouteAllResources' }; }

export type RouteOrganizations = { type: 'RouteOrganizations' };
export function toRouteOrganizations():
  RouteOrganizations { return { type: 'RouteOrganizations' }; }

export type RouteObjectives = { type: 'RouteObjectives' };
export function toRouteObjectives(): RouteObjectives { return { type: 'RouteObjectives' }; }

export type RouteMissing = { type: 'RouteMissing' };
export function toRouteMissing(): RouteMissing { return { type: 'RouteMissing' }; }

export type RouteKeycloakGarbage = { type: 'RouteKeycloakGarbage' };
export function toRouteKeycloakGarbage():
  RouteKeycloakGarbage { return { type: 'RouteKeycloakGarbage' }; }