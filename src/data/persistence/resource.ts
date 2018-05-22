import { credentials, getFormHeaders } from 'actions/utils/credentials';
import { configuration } from 'actions/utils/config';

// todo
export function deleteResource(courseId: string, resourceId: string) {
  const method = 'DELETE';
  const url = `${configuration.baseUrl}/${courseId}/resources/${resourceId}`;
  const headers = getFormHeaders(credentials);
}
