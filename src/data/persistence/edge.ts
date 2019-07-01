import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { credentials, getHeaders } from '../../actions/utils/credentials';
import { Edge } from 'types/edge';
import { CourseIdVers, CourseGuid } from 'data/types';

/**
 * Fetches all references for the course or resource, returns a Promise to resolve to
 * a list of edges
 */
export function fetchEdges(
  packageId: CourseGuid | CourseIdVers,
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
    ? `${configuration.baseUrl}/${packageId.value()}/resources/edges/${resourceId}`
    : `${configuration.baseUrl}/${packageId.value()}/edges`;

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

  return authenticatedFetch({ method, url, headers, query }).then(res => (res as Edge[]));
}

/**
 * Fetches all references for the course or resource beloning to the list of source/destination ids,
 * returns a Promise to resolve to a list of edges
 */
export function fetchEdgesByIds(
  packageId: CourseGuid | CourseIdVers,
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
  const url = `${configuration.baseUrl}/${packageId.value()}/edges/by-ids`;

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
  }).then(res => (res as Edge[]));
}
