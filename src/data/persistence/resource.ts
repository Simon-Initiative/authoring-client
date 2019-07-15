import { credentials, getFormHeaders } from 'actions/utils/credentials';
import { configuration } from 'actions/utils/config';
import { authenticatedFetch } from 'data/persistence/common';
import { CourseIdVers, ResourceId } from 'data/types';

export function deleteResource(course: CourseIdVers, resourceId: ResourceId):
  Promise<{}> {
  const method = 'DELETE';
  // tslint:disable-next-line:max-line-length
  const url = `${configuration.baseUrl}/${course}/resources/${resourceId}`;
  const headers = getFormHeaders(credentials);

  return authenticatedFetch({ method, url, headers });
}
