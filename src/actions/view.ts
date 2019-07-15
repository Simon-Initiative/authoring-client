import { Maybe } from 'tsmonad';
import history from 'utils/history';
import * as router from 'types/router';
import { CourseIdVers, DocumentId, iLiterallyCantEven, ResourceId } from 'data/types';

export type ViewActions = {
  // Application Routes
  viewAllCourses: () => void,
  viewCreateCourse: () => void,
  viewImportCourse: () => void,
  viewMissingPage: () => void,

  // Course Routes
  viewCourse: (course: CourseIdVers, orgId: Maybe<ResourceId>) => void,
  viewAllResources: (course: CourseIdVers, orgId: Maybe<ResourceId>) => void,
  viewOrganizations: (course: CourseIdVers, orgId: Maybe<ResourceId>) => void,
  viewObjectives: (course: CourseIdVers, orgId: Maybe<ResourceId>) => void,
  viewSkills: (course: CourseIdVers, orgId: Maybe<ResourceId>) => void,
  viewDocument: (documentId: DocumentId, course: CourseIdVers, orgId: Maybe<ResourceId>) => void,
};

// Application Routes
export const viewAllCourses = () => pushRoute(router.toRouteRoot());
export const viewCreateCourse = () => pushRoute(router.toRouteCreate());
export const viewImportCourse = () => pushRoute(router.toRouteImport());
export const viewMissingPage = () => pushRoute(router.toRouteMissing());

// Course Routes
export const viewCourse = (course: CourseIdVers, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteCourseOverview()));

export const viewAllResources = (course: CourseIdVers, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteAllResources()));

export const viewOrganizations = (course: CourseIdVers, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteOrganizations()));

export const viewSkills = (course: CourseIdVers, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteSkills()));

export const viewObjectives = (course: CourseIdVers, orgId: Maybe<ResourceId>) =>
  pushRoute(router.toRouteCourse(course, orgId, router.toRouteObjectives()));

export const viewDocument = (id: ResourceId | string, course: CourseIdVers,
  orgId: Maybe<ResourceId>) => {
  pushRoute(router.toRouteCourse(course, orgId,
    typeof id === 'string' ? router.toRouteOrgComponent(id) : router.toRouteResource(id)));
};

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
      const { courseId, orgId } = route;
      const courseIdVers = courseId.value();
      const organizationId = orgId.caseOf({
        just: o => `?organization=${o.value()}`,
        nothing: () => '',
      });
      switch (route.route.type) {
        case 'RouteCourseOverview':
          return `/${courseIdVers}${organizationId}`;
        case 'RouteResource': return `/${courseIdVers}/${route.route.id.value()}${organizationId}`;
        case 'RouteOrgComponent': return `/${courseIdVers}/${route.route.id}${organizationId}`;
        case 'RoutePreview': return `/${courseIdVers}/preview/${organizationId}`;
        case 'RouteSkills': return `/${courseIdVers}/skills${organizationId}`;
        case 'RouteObjectives': return `/${courseIdVers}/objectives${organizationId}`;
        case 'RouteAllResources': return `/${courseIdVers}/resources${organizationId}`;
        case 'RouteOrganizations': return `/${courseIdVers}/organizations${organizationId}`;
      }
    default: return iLiterallyCantEven(route);
  }
}
