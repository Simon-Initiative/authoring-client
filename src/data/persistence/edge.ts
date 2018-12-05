import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { credentials, getFormHeaders } from '../../actions/utils/credentials';
import { Edge } from 'types/edge';

/**
 * Fetches all references for the course or resource, returns a Promise to resolve to
 * a list of edges
 */
export function fetchEdges(
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

  const method = 'GET';
  const url = byResource
    ? `${configuration.baseUrl}/${packageId}/resources/edges/${resourceId}`
    : `${configuration.baseUrl}/${packageId}/edges`;

  const headers = getFormHeaders(credentials);
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
