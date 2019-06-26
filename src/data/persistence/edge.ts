import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { credentials, getHeaders } from '../../actions/utils/credentials';
import { Edge } from 'types/edge';

/**
 * Fetches all references for the course or resource, returns a Promise to resolve to
 * a list of edges
 */
export function fetchEdges( // KEVIN-1936 trace and log this
  packageId: string,
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

  // KEVIN-1936 -- this is where the API call is made
  const method = 'GET';
  const url = byResource
    ? `${configuration.baseUrl}/${packageId}/resources/edges/${resourceId}`
    : `${configuration.baseUrl}/${packageId}/edges`;

  console.log("Fetching Edges");
  console.log(url);

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
  packageId: string,
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
  const url = `${configuration.baseUrl}/${packageId}/edges/by-ids`;

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
    method, url, headers, query, body: JSON.stringify(body) }).then(res => (res as Edge[]));
}
