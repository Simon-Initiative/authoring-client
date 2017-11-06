import { user as userActions } from '../actions/user';
import { OtherAction } from './utils';

// tslint:disable-next-line
import { UserProfile } from 'app/types/user';

type UserAction =
  userActions.loginSuccessAction |
  OtherAction;

export type UserInfo = {
  user: string,
  userId: string,
  logoutUrl: string,
  profile: UserProfile,
};

export function user(state : UserInfo = null, action: UserAction) : UserInfo {
  switch (action.type) {
    case userActions.LOGIN_SUCCESS:
      return {
        profile: action.profile,
        user: action.username,
        userId: action.userId,
        logoutUrl: action.logoutUrl,
      };
    default:
      return state;
  }
}

