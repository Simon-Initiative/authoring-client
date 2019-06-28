import { Maybe } from 'tsmonad';
import { CourseIdV } from 'data/types';

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
  courseId: CourseIdV,
  orgId: Maybe<string>,
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

export function toRouteCourse(courseId: CourseIdV,
  orgId: Maybe<string>, route: RouteCourseOption): RouteCourse {
  return {
    type: 'RouteCourse',
    courseId,
    orgId,
    route,
  };
}

export type RouteRoot = {
  type: 'RouteRoot',
};
export function toRouteRoot(): RouteRoot {
  return {
    type: 'RouteRoot',
  };
}

export type RouteCreate = {
  type: 'RouteCreate',
};
export function toRouteCreate(): RouteCreate {
  return {
    type: 'RouteCreate',
  };
}

export type RouteImport = {
  type: 'RouteImport',
};
export function toRouteImport(): RouteImport {
  return {
    type: 'RouteImport',
  };
}

export type RouteCourseOverview = {
  type: 'RouteCourseOverview',
};
export function toRouteCourseOverview(): RouteCourseOverview {
  return {
    type: 'RouteCourseOverview',
  };
}

export type RouteResource = {
  type: 'RouteResource',
  resourceId: string,
};
export function toRouteResource(resourceId: string): RouteResource {
  return {
    type: 'RouteResource',
    resourceId,
  };
}

export type RoutePreview = {
  type: 'RoutePreview',
  resourceId: string,
};
export function toRoutePreview(resourceId: string): RoutePreview {
  return {
    type: 'RoutePreview',
    resourceId,
  };
}

export type RouteSkills = {
  type: 'RouteSkills',
};
export function toRouteSkills(): RouteSkills {
  return {
    type: 'RouteSkills',
  };
}

export type RouteAllResources = {
  type: 'RouteAllResources',
};
export function toRouteAllResources(): RouteAllResources {
  return {
    type: 'RouteAllResources',
  };
}

export type RouteOrganizations = {
  type: 'RouteOrganizations',
};
export function toRouteOrganizations(): RouteOrganizations {
  return {
    type: 'RouteOrganizations',
  };
}

export type RouteObjectives = {
  type: 'RouteObjectives',
};
export function toRouteObjectives(): RouteObjectives {
  return {
    type: 'RouteObjectives',
  };
}

export type RouteMissing = {
  type: 'RouteMissing',
};
export function toRouteMissing(): RouteMissing {
  return {
    type: 'RouteMissing',
  };
}

export type RouteKeycloakGarbage = {
  type: 'RouteKeycloakGarbage',
};
export function toRouteKeycloakGarbage(): RouteKeycloakGarbage {
  return {
    type: 'RouteKeycloakGarbage',
  };
}
