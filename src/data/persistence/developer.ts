import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { UserInfo } from '../content/user_info';
import { CourseIdVers, CourseGuid } from 'data/types';

export function developerRegistration(course: CourseGuid | CourseIdVers,
  userNames: string[], action: string): Promise<UserInfo[]> {
  // Valid values for 'action' is limited to 'add' or 'remove'
  const url = `${configuration.baseUrl}/${course}/developers/registration?action=${action}`;
  const body = JSON.stringify(userNames);
  const method = 'POST';

  return (authenticatedFetch({ url, method, body }) as any)
    .then((json) => {
      const userInfos = [];
      if (json instanceof Array) {
        json.forEach(item => userInfos.push(UserInfo.fromPersistence(item)));
      } else {
        userInfos.push(UserInfo.fromPersistence(json));
      }
      return [...userInfos];
    });
}
