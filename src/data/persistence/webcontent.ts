import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { credentials, getFormHeaders } from '../../actions/utils/credentials';
import { PaginatedResponse, CourseIdVers, CourseGuid, ResourceId } from 'data/types';
import { Edge } from 'types/edge';
import { WebContent } from 'data/content/webcontent';
import { parseEdge } from 'data/persistence/edge';

/**
 * Uploads a file, receives a promise to deliver path on server
 * that the file is being stored as. Rejects if the file name conflicts
 * with another file.
 */
export function createWebContent(course: CourseGuid | CourseIdVers, file: File): Promise<string> {

  const method = 'POST';
  const url = `${configuration.baseUrl}/${course}/webcontents/upload`;
  const headers = getFormHeaders(credentials);
  const body = new FormData();

  // Lowercase file extension. File.name is read only, so we need to create a new file from the
  // contents of the file blob.
  const blob = file.slice(0, -1, file.type);
  const fileNameWithDot = file.name.slice(
    0, file.name.indexOf('.') !== -1
      ? file.name.indexOf('.') + 1
      : file.name.length);
  const extension = file.name.indexOf('.') !== -1
    ? file.name.substr(file.name.indexOf('.') + 1).toLowerCase()
    : '';
  const newFile = new File([blob], fileNameWithDot + extension, { type: file.type });
  body.append('file', newFile);

  return authenticatedFetch({ method, url, headers, body })
    .then(result => result[0].fileNode.pathTo);
}

/**
 * Fetches all webcontent for the course, returns a Promise to resolve to
 * a list of webcontents
 */
export function fetchWebContent(
  course: CourseGuid | CourseIdVers, offset?: number, limit?: number,
  mimeFilter?: string, pathFilter?: string, searchText?: string, orderBy?: string,
  order?: string): Promise<PaginatedResponse<WebContent>> {

  const method = 'GET';
  const url = `${configuration.baseUrl}/${course}/webcontents`;
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
export function fetchWebContentReferences(
  course: CourseGuid | CourseIdVers,
  queryParams: {
    relationship?: string,
    purpose?: string,
    sourceId?: ResourceId,
    sourceType?: string,
    destinationId?: ResourceId,
    destinationType?: string,
    referenceType?: string,
    status?: string,
  } = {},
  byResource = false,
  resourceId = ResourceId.of('')): Promise<Edge[]> {
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

  const headers = getFormHeaders(credentials);
  const query = Object.assign(
    {},
    relationship ? { relationship } : {},
    purpose ? { purpose } : {},
    sourceId ? { sourceId: sourceId.value() } : {},
    sourceType ? { sourceType } : {},
    destinationId ? { destinationId: destinationId.value() } : {},
    destinationType ? { destinationType } : {},
    referenceType ? { referenceType } : {},
    status ? { relationship } : {},
  );

  return authenticatedFetch({ method, url, headers, query })
    .then((res: any[]) => res.map(parseEdge));
}
