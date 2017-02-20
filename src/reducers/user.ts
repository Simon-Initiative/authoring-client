import { user as userActions } from '../actions/user';
import { OtherAction } from './utils';

type UserAction = 
  userActions.loginSuccessAction |
  OtherAction

export type UserInfo = {
  user: string,
  userId: string
};

export function user(state : UserInfo = null, action: UserAction) : UserInfo {
  switch (action.type) {
  case userActions.LOGIN_SUCCESS:
    return { user: action.username, userId: action.userId};
  default:
    return state;
  }
}

