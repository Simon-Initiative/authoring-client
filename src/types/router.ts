import { Maybe } from 'tsmonad';
import { CourseIdVers, ResourceId } from 'data/types';

export type RouteOption =
  | RouteApplicationOption
  | RouteCourse;

export type RouteApplicationOption =
  | RouteRoot
  | RouteCreate
  | RouteImport
  | RouteMissing
  | RouteLoading;

export type RouteCourse = {
  type: 'RouteCourse',
  courseId: CourseIdVers,
  orgId: Maybe<ResourceId>,
  route: RouteCourseOption,
};

export type RouteCourseOption =
  | RouteCourseOverview
  | RouteResource
  | RouteOrgComponent
  | RoutePreview
  | RouteSkills
  | RouteAllResources
  | RouteOrganizations
  | RouteObjectives;

export function toRouteCourse(courseId: CourseIdVers,
  orgId: Maybe<ResourceId>, route: RouteCourseOption): RouteCourse {
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

export type RouteLoading = {
  type: 'RouteLoading',
};
export function toRouteLoading(): RouteLoading {
  return {
    type: 'RouteLoading',
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
  id: ResourceId,
};
export function toRouteResource(id: ResourceId): RouteResource {
  return {
    type: 'RouteResource',
    id,
  };
}

export type RouteOrgComponent = {
  type: 'RouteOrgComponent',
  id: string,
};
export function toRouteOrgComponent(id: string): RouteOrgComponent {
  return {
    type: 'RouteOrgComponent',
    id,
  };
}

export type RoutePreview = {
  type: 'RoutePreview',
};
export function toRoutePreview(): RoutePreview {
  return {
    type: 'RoutePreview',
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
