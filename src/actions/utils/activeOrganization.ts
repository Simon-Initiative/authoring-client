import { Maybe } from 'tsmonad';
import { loadFromLocalStorage, saveToLocalStorage } from 'utils/localstorage';

export const ACTIVE_ORG_STORAGE_KEY = 'activeOrganization';
export const activeOrgUserKey = (username: string, courseGuid: string) =>
  username + ':' + courseGuid;


export function updateActiveOrgPref(
  courseGuid: string, username: string, organizationGuid: string) {

  const userKey = activeOrgUserKey(username, courseGuid);

  Maybe.maybe(loadFromLocalStorage(ACTIVE_ORG_STORAGE_KEY))
    .caseOf({
      just: (prefs) => {
        prefs[userKey] = organizationGuid;
        saveToLocalStorage(ACTIVE_ORG_STORAGE_KEY, JSON.stringify(prefs));
      },
      nothing: () => saveToLocalStorage(
        ACTIVE_ORG_STORAGE_KEY, JSON.stringify({ [userKey]: organizationGuid })),
    });
}
