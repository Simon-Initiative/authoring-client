/** Global types related to user */

export type UserProfile = {
  attributes: Object,
  createdTimestamp: number,
  disableableCredentialTypes: string[],
  email: string,
  emailVerified: boolean,
  enabled: boolean,
  firstName: string,
  id: string,
  lastName: string,
  requiredActions: Object[],
  totp: boolean,
  username: string,
};
