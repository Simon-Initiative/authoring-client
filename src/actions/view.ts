import { iLiterallyCantEven, ResourceId, CourseIdentifier, DocumentId } from 'data/types';
import { Maybe } from 'tsmonad';
import history from 'utils/history';
import * as router from 'types/router';
import {
  fromCourseGuidOrIdentifier, fromResourceGuidOrId,
} from 'data/utils/idwrappers';

export type ViewActions = {
  // Application Routes
  viewAllCourses: () => void,
  viewCreateCourse: () => void,
  viewImportCourse: () => void,
  viewMissingPage: () => void,

  // Course Routes
  viewCourse: (course: CourseIdentifier) => void,
  viewAllResources: (course: CourseIdentifier, orgId: ResourceId) => void,
  viewOrganizations: (course: CourseIdentifier, orgId: ResourceId) => void,
  viewObjectives: (course: CourseIdentifier, orgId: ResourceId) => void,
  viewSkills: (course: CourseIdentifier, orgId: ResourceId) => void,
  viewResource: (documentId: DocumentId, course: CourseIdentifier, orgId: ResourceId) => void,
};

// Application Routes
export const viewAllCourses = () => pushRoute(router.toRouteImport());
export const viewCreateCourse = () => pushRoute(router.toRouteCreate());
export const viewImportCourse = () => pushRoute(router.toRouteImport());
export const viewMissingPage = () => pushRoute(router.toRouteMissing());

// Course Routes
export const viewCourse = (course: CourseIdentifier, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteCourseOverview()));

export const viewAllResources = (course: CourseIdentifier, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteAllResources()));

export const viewOrganizations = (course: CourseIdentifier, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteOrganizations()));

export const viewSkills = (course: CourseIdentifier, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteSkills()));

export const viewObjectives = (course: CourseIdentifier, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteObjectives()));

export const viewResource =
  (resourceId: ResourceId, course: CourseIdentifier, orgId: Maybe<ResourceId>) =>
    pushRoute(router.toRouteCourse(course, orgId, router.toRouteResource(resourceId)));

function pushRoute(route: router.RouteOption) {
  history.push(buildUrlFromRoute(route));
}


export function buildUrlFromRoute(route: router.RouteOption) {
  switch (route.type) {
    case 'RouteCreate': return '/create';
    case 'RouteImport': return '/import';
    case 'RouteRoot': return '/';
    case 'RouteMissing': return '/404';
    case 'RouteCourse':
      const { course, organization } = route;
      const courseIdVersion = fromCourseGuidOrIdentifier(course);
      const organizationId = organization.caseOf({
        just: o => `?organization=${fromResourceGuidOrId(o)}`,
        nothing: () => '',
      });
      switch (route.route.type) {
        case 'RouteCourseOverview':
          return `/${courseIdVersion}${organizationId}`;
        case 'RouteResource':
          const resourceId = fromResourceGuidOrId(route.route.resource);
          return `/${courseIdVersion}/${resourceId}${organizationId}`;
        case 'RoutePreview': return `/${courseIdVersion}/preview/${organizationId}`;
        case 'RouteSkills': return `/${courseIdVersion}/skills${organizationId}`;
        case 'RouteObjectives': return `/${courseIdVersion}/objectives${organizationId}`;
        case 'RouteAllResources': return `/${courseIdVersion}/resources${organizationId}`;
        case 'RouteOrganizations': return `/${courseIdVersion}/organizations${organizationId}`;
      }
    default: return iLiterallyCantEven(route);
  }
}