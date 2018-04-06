import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { SkillFiles } from 'editors/document/course/SkillsIngestion';
import { credentials, getFormHeaders } from '../../actions/utils/credentials';

// Return a promise to allow UI to see file upload is complete
export function skillsUpload(courseId: string, skillFiles: SkillFiles): Promise<File> {
  const method = 'POST';
  const url = `${configuration.baseUrl}/${courseId}/Idmodel/import`;
  const headers = getFormHeaders(credentials);
  const body = new FormData();
  // Best way to push each skillFile into the body of request?
  // skillFiles.forEach(file => body.append('file', file));

  // Is this right? does it have all the data it needs?
  // return authenticatedFetch({ method, url, headers, body });
  //   .then(result => result[0].fileNode.pathTo);
  console.log('courseid', courseId);
  console.log('skillFiles', skillFiles);
  return undefined;
}

export function skillsDownload(courseId: string): Promise<SkillFiles> {
  const method = 'GET';
  // This URL throws a 404. What am I doing wrong
  const url = `${configuration.baseUrl}/${courseId}/Idmodel/export`;
  const headers = getFormHeaders(credentials);

  return authenticatedFetch({ method, url, headers }).then(res =>
    (res as Promise<SkillFiles>));
}
