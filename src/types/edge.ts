import { LegacyTypes, ResourceGuid, CourseIdVers, ResourceId } from 'data/types';

export type PathElement = {
  name: string;
  parent: PathElement;
};

export type EdgeRelationship = 'UTILIZES' | 'LINKS' | 'INLINES' | 'CONTAINS' | 'SUPPORTS'
  | 'REFERENCES';
export type EdgeStatus = 'NOT_VALIDATED' | 'DESTINATION_PRESENT' | 'DESTINATION_MISSING';
export type EdgeReferenceType = 'unknown' | 'inline' | 'image' | 'resourceref' | 'video' |
  'activity_link' | 'objref' | 'activity' | 'image_hotspot' | 'flash' | 'custom' | 'param' |
  'xref' | 'alternate' | 'skillref' | 'iframe' | 'concept' | 'objective' | 'audio' | 'asset' |
  'source' | 'pool_ref' | 'image_input' | 'interface' | 'dataset' | 'pronunciation' | 'unity' |
  'track' | 'conjugate' | 'director' | 'mathematica';

export type Edge = {
  rev: number;
  guid: string;
  relationship: EdgeRelationship;

  sourceCourseIdVers: CourseIdVers;
  sourceGuid: ResourceGuid;
  sourceId: ResourceId;
  sourceType: LegacyTypes;

  destinationCourseIdVers: CourseIdVers;
  destinationGuid: ResourceGuid;
  destinationId: ResourceId;
  destinationType: LegacyTypes;

  referenceType: EdgeReferenceType;
  status: EdgeStatus;
  metadata: {
    jsonObject: {
      pathInfo: PathElement;
      sourceGuid: string;
    };
  };
};
