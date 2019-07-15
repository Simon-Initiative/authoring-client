import { configuration } from '../../actions/utils/config';
import { credentials, getFormHeaders } from '../../actions/utils/credentials';
import { CourseGuid, CourseIdVers } from 'data/types';

export function skillsDownload(course: CourseGuid | CourseIdVers): Promise<void> {
  const method = 'GET';
  const url = `${configuration.baseUrl}/${course}/ldmodel/export`;
  const headers = getFormHeaders(credentials);

  // tslint:disable-next-line:max-line-length
  // from https://stackoverflow.com/questions/32545632/how-can-i-download-a-file-using-window-fetch/42274086#42274086
  return fetch(url, { method, headers })
    .then(res => res.blob())
    .then((blob) => {
      const dlUrl = (window as any).URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = 'Skills.zip';
      a.click();
    });
}
