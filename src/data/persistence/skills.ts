import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { SkillFiles } from 'editors/document/course/CourseEditor';
import { credentials, getFormHeaders } from '../../actions/utils/credentials';

export function skillsUpload(courseId: string, skillFiles: SkillFiles): void {
  const method = 'POST';
  const url = `${configuration.baseUrl}/${courseId}/Idmodel/import`;
  const headers = getFormHeaders(credentials);
  const body = new FormData();
  skillFiles.forEach(file => body.append('file', file));

  authenticatedFetch({ method, url, headers, body })
    .then(result => result[0].fileNode.pathTo);

  console.log('courseid', courseId);
  console.log('skillFiles', skillFiles);
}

export function skillsDownload(courseId: string): Promise<SkillFiles> {
  const method = 'GET';
  const url = `${configuration.baseUrl}/${courseId}/Idmodel/export`;
  const headers = getFormHeaders(credentials);

  return authenticatedFetch({ method, url, headers }).then(res =>
    (res as Promise<SkillFiles>));
}
