import { credentials, getFormHeaders } from 'actions/utils/credentials';
import { configuration } from 'actions/utils/config';
import { authenticatedFetch } from 'data/persistence/common';

export function deleteResource(courseId: string, resourceId: string): Promise<{}> {
  const method = 'DELETE';
  const url = `${configuration.baseUrl}/${courseId}/resources/${resourceId}`;
  const headers = getFormHeaders(credentials);

  return authenticatedFetch({ method, url, headers });
}
