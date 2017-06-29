import { authenticatedFetch, Document } from './common';
import { configuration } from '../../actions/utils/config';
import { CourseId, DocumentId } from '../types';
import * as models from '../models';
import { Resource } from '../content/resource';
import { UserInfo } from '../content/user_info';

export function developerRegistration(courseId: string,
                                      userNames: string[], action: string): Promise<UserInfo[]> {
  // Valid values for 'action' is limited to 'add' or 'remove'
  const url = `${configuration.baseUrl}/${courseId}/developers/registration?action=${action}`;
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
