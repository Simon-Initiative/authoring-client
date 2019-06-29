import { credentials, getFormHeaders } from 'actions/utils/credentials';
import { configuration } from 'actions/utils/config';
import { authenticatedFetch } from 'data/persistence/common';
import { CourseGuid, CourseIdVers } from 'data/types';

export function deleteResource(course: CourseGuid | CourseIdVers, resourceId: string): Promise<{}> {
  const method = 'DELETE';
  // tslint:disable-next-line:max-line-length
  const url = `${configuration.baseUrl}/${course.value()}/resources/${resourceId}`;
  const headers = getFormHeaders(credentials);

  return authenticatedFetch({ method, url, headers });
}
