import * as Immutable from 'immutable';

export type UserInfoParams = {
  userName?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  isDeveloper?: boolean,
};

export class UserInfo extends Immutable.Record({
  contentType: 'UserInfo', userName: '', firstName: '', lastName: '', email: '', isDeveloper: false,
}) {

  contentType: 'UserInfo';
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  isDeveloper: boolean;

  constructor(params?: UserInfoParams) {
    params ? super(params) : super();
  }

  with(values: UserInfoParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object): UserInfo {
    const a = (root as any);
    return new UserInfo({
      userName: a.userName, firstName: a.firstName, lastName: a.lastName,
      email: a.email, isDeveloper: a.isDeveloper,
    });
  }

  toPersistence(): Object {
    return {
      userName: this.userName,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      isDeveloper: this.isDeveloper,
    };
  }
}
