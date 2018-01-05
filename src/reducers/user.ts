import { user as userActions } from '../actions/user';
import { OtherAction } from './utils';
// tslint:disable-next-line
import {UserProfile} from 'types/user';

type UserAction =
  userActions.loginSuccessAction |
  OtherAction;

export type UserState = {
  user: string,
  userId: string,
  logoutUrl: string,
  profile: UserProfile,
};

export function user(state: UserState = null, action: UserAction): UserState {
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

