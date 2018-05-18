import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { credentials, getFormHeaders } from '../../actions/utils/credentials';
import { PaginatedResponse } from 'data/types';
import { Edge } from 'types/edge';
import { WebContent } from 'data/content/webcontent';

/**
 * Uploads a file, receives a promise to deliver path on server
 * that the file is being stored as. Rejects if the file name conflicts
 * with another file.
 */
export function createWebContent(courseId: string, file): Promise<string> {

  const method = 'POST';
  const url = `${configuration.baseUrl}/${courseId}/webcontents/upload`;
  const headers = getFormHeaders(credentials);
  const body = new FormData();
  body.append('file', file);

  return authenticatedFetch({ method, url, headers, body })
    .then(result => result[0].fileNode.pathTo);
}

/**
 * Fetches all webcontent for the course, returns a Promise to resolve to
 * a list of webcontents
 */
export function fetchWebContent(
    courseId: string, offset?: number, limit?: number,
    mimeFilter?: string, pathFilter?: string, searchText?: string, orderBy?: string,
    order?: string): Promise<PaginatedResponse<WebContent>> {

  const method = 'GET';
  const url = `${configuration.baseUrl}/${courseId}/webcontents`;
  const headers = getFormHeaders(credentials);
  const query = Object.assign(
    {},
    offset ? { offset } : {},
    limit ? { limit } : {},
    mimeFilter ? { mimeFilter } : {},
    pathFilter ? { pathFilter } : {},
    searchText ? { searchText } : {},
    orderBy ? { orderBy } : {},
    order ? { order } : {},
  );

  return authenticatedFetch({ method, url, headers, query }).then(res =>
    (res as PaginatedResponse<WebContent>));
}

/**
 * Fetches all webcontent references for the course, returns a Promise to resolve to
 * a list of edges
 */
export function fetchWebContentReferences(packageId: string, queryParams?: {
  relationship?: string,
  purpose?: string,
  sourceId?: string,
  sourceType?: string,
  destinationId?: string,
  destinationType?: string,
  referenceType?: string,
  status?: string,
}): Promise<Edge[]> {
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
  const url = `${configuration.baseUrl}/${packageId}/edges`;
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

export function fetchResourceReferences(resourceId: string, queryParams?: {
  relationship?: string,
  purpose?: string,
  sourceId?: string,
  sourceType?: string,
  destinationId?: string,
  destinationType?: string,
  referenceType?: string,
  status?: string,
}): Promise<Edge[]> {
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
  const url = `${configuration.baseUrl}/${resourceId}/edges`;
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
