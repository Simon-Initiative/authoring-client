import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { credentials, getHeaders } from '../../actions/utils/credentials';
import { Edge, EdgeRelationship, EdgeReferenceType, EdgeStatus } from 'types/edge';
import { CourseIdVers, ResourceGuid, ResourceId, LegacyTypes } from 'data/types';
import { Maybe } from 'tsmonad';

/**
 * Fetches all references for the course or resource, returns a Promise to resolve to
 * a list of edges
 */
export function fetchEdges(
  course: CourseIdVers,
  queryParams: {
    relationship?: string,
    purpose?: string,
    sourceId?: string,
    sourceType?: string,
    destinationId?: string,
    destinationType?: string,
    referenceType?: string,
    status?: string,
  } = {},
  byResource = false,
  resourceId = ''): Promise<Edge[]> {
  const {
    relationship,
    purpose,
    sourceId,
    sourceType,
    destinationId,
    destinationType,
    referenceType,
    status,
  } = queryParams;

  const method = 'GET';
  const url = byResource
    ? `${configuration.baseUrl}/${course}/resources/edges/${resourceId}`
    : `${configuration.baseUrl}/${course}/edges`;

  const headers = getHeaders(credentials);
  const query = Object.assign(
    {},
    relationship ? { relationship } : {},
    purpose ? { purpose } : {},
    sourceId ? { sourceId } : {},
    sourceType ? { sourceType } : {},
    destinationId ? { destinationId } : {},
    destinationType ? { destinationType } : {},
    referenceType ? { referenceType } : {},
    status ? { relationship } : {},
  );

  return authenticatedFetch({ method, url, headers, query })
    .then((res: any[]) => res.map(parseEdge));
}

/**
 * Fetches all references for the course or resource beloning to the list of source/destination ids,
 * returns a Promise to resolve to a list of edges
 */
export function fetchEdgesByIds(
  course: CourseIdVers,
  queryParams: {
    relationship?: string,
    purpose?: string,
    sourceType?: string,
    destinationType?: string,
    referenceType?: string,
    status?: string,
  } = {},
  body: {
    sourceIds?: string[],
    destinationIds?: string[],
  } = {}): Promise<Edge[]> {
  const {
    relationship,
    purpose,
    sourceType,
    destinationType,
    referenceType,
    status,
  } = queryParams;

  const method = 'POST';
  const url = `${configuration.baseUrl}/${course}/edges/by-ids`;

  const headers = getHeaders(credentials);
  const query = Object.assign(
    {},
    relationship ? { relationship } : {},
    purpose ? { purpose } : {},
    sourceType ? { sourceType } : {},
    destinationType ? { destinationType } : {},
    referenceType ? { referenceType } : {},
    status ? { relationship } : {},
  );

  return authenticatedFetch({
    method, url, headers, query, body: JSON.stringify(body),
  }).then((res: any[]) => res.map(parseEdge));
}

export function parseEdge(o: any): Edge {
  const [sourceCourseIdVers, sourceId] = parseIds(o.sourceId);
  const [destinationCourseIdVers, destinationId] = parseIds(o.destinationId);

  return {
    rev: o.rev,
    guid: o.guid,
    relationship: o.relationship as EdgeRelationship,

    sourceGuid: ResourceGuid.of(o.sourceGuid),
    sourceCourseIdVers,
    sourceId,
    sourceType: o.sourceType as LegacyTypes,

    destinationGuid: ResourceGuid.of(o.destinationGuid),
    destinationCourseIdVers,
    destinationId,
    destinationType: o.destinationType as LegacyTypes,

    referenceType: o.referenceType as EdgeReferenceType,
    status: o.status as EdgeStatus,
    metadata: o.metadata,
  };

  function parseIds(input: string): [CourseIdVers, ResourceId] {
    return splitIds(':', input).valueOr(
      splitIds('_', input).valueOr([
        CourseIdVers.of('', ''),
        ResourceId.of(''),
      ]));
  }

  function splitIds(delimiter: string, input: string): Maybe<[CourseIdVers, ResourceId]> {
    const parts = input.split(delimiter);
    if (parts.length === 3) {
      return Maybe.just([
        CourseIdVers.of(parts[0], parts[1]),
        ResourceId.of(parts[2]),
      ]);
    }
    return Maybe.nothing<[CourseIdVers, ResourceId]>();
  }
}
