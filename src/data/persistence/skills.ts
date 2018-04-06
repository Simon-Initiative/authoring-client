import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { credentials, getFormHeaders } from '../../actions/utils/credentials';

export function skillsDownload(courseId: string): Promise<File> {
  const method = 'GET';
  // This URL throws a 404. What am I doing wrong
  const url = `${configuration.baseUrl}/${courseId}/Idmodel/export`;
  const headers = getFormHeaders(credentials);

  return authenticatedFetch({ method, url, headers }).then(res =>
    (res as Promise<File>));
}
