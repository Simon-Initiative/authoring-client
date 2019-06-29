import { Maybe } from 'tsmonad';
import { loadFromLocalStorage, saveToLocalStorage } from 'utils/localstorage';
import { CourseIdVers } from 'data/types';

export const ACTIVE_ORG_STORAGE_KEY = 'activeOrganization';
export const activeOrgUserKey = (username: string, courseId: CourseIdVers) =>
  username + ':' + courseId;


export function updateActiveOrgPref(
  courseId: CourseIdVers, username: string, organizationId: string) {

  const userKey = activeOrgUserKey(username, courseId);

  Maybe.maybe(loadFromLocalStorage(ACTIVE_ORG_STORAGE_KEY))
    .caseOf({
      just: (prefs) => {
        prefs[userKey] = organizationId;
        saveToLocalStorage(ACTIVE_ORG_STORAGE_KEY, JSON.stringify(prefs));
      },
      nothing: () => saveToLocalStorage(
        ACTIVE_ORG_STORAGE_KEY, JSON.stringify({ [userKey]: organizationId })),
    });
}
