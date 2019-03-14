export const ACTIVE_ORG_STORAGE_KEY = 'activeOrganization';
export const activeOrgUserKey = (username: string, courseGuid: string) =>
  username + ':' + courseGuid;
