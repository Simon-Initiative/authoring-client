import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { CourseId, DocumentId } from '../types';
import { credentials, getFormHeaders } from '../../actions/utils/credentials';

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
    .then(result => result.path);
}
