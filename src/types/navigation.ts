export type NavigationItem = OrganizationItem | PackageOverview | LearningObjectives;

export interface OrganizationItem {
  type: 'OrganizationItem';
  id: string;
}

export interface PackageOverview {
  type: 'PackageOverview';
}

export interface LearningObjectives {
  type: 'LearningObjectives';
}

export function makeOrganizationItem(id: string) : OrganizationItem {
  return {
    type: 'OrganizationItem',
    id,
  };
}

export function makePackageOverview() : PackageOverview {
  return {
    type: 'PackageOverview',
  };
}

export function makeLearningObjectives() : LearningObjectives {
  return {
    type: 'LearningObjectives',
  };
}


