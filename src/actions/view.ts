import { Maybe } from 'tsmonad';
import history from 'utils/history';
import * as router from 'types/router';
import { CourseIdV, DocumentId, iLiterallyCantEven } from 'data/types';
import { fromCourseIdV } from 'data/utils/idwrappers';

export type ViewActions = {
  // Application Routes
  viewAllCourses: () => void,
  viewCreateCourse: () => void,
  viewImportCourse: () => void,
  viewMissingPage: () => void,

  // Course Routes
  viewCourse: (course: CourseIdV, orgId: Maybe<string>) => void,
  viewAllResources: (course: CourseIdV, orgId: Maybe<string>) => void,
  viewOrganizations: (course: CourseIdV, orgId: Maybe<string>) => void,
  viewObjectives: (course: CourseIdV, orgId: Maybe<string>) => void,
  viewSkills: (course: CourseIdV, orgId: Maybe<string>) => void,
  viewDocument: (documentId: DocumentId, course: CourseIdV, orgId: Maybe<string>) => void,
};

// Application Routes
export const viewAllCourses = () => pushRoute(router.toRouteImport());
export const viewCreateCourse = () => pushRoute(router.toRouteCreate());
export const viewImportCourse = () => pushRoute(router.toRouteImport());
export const viewMissingPage = () => pushRoute(router.toRouteMissing());

// Course Routes
export const viewCourse = (course: CourseIdV, orgId: Maybe<string>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteCourseOverview()));

export const viewAllResources = (course: CourseIdV, orgId: Maybe<string>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteAllResources()));

export const viewOrganizations = (course: CourseIdV, orgId: Maybe<string>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteOrganizations()));

export const viewSkills = (course: CourseIdV, orgId: Maybe<string>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteSkills()));

export const viewObjectives = (course: CourseIdV, orgId: Maybe<string>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteObjectives()));

export const viewDocument =
  (resourceId: string, course: CourseIdV, orgId: Maybe<string>) =>
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
      const { courseIdentifier, orgId } = route;
      const courseIdVersion = fromCourseIdentifier(courseIdentifier);
      const organizationId = orgId.caseOf({
        just: o => `?organization=${o}`,
        nothing: () => '',
      });
      switch (route.route.type) {
        case 'RouteCourseOverview':
          return `/${courseIdVersion}${organizationId}`;
        case 'RouteResource':
          const resourceId = route.route.resourceId;
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
