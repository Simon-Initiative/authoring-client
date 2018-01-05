import { configuration } from './utils/config';
import { initialize } from './utils/keycloak';
import { UserProfile } from 'types/user';

export module user {
  export type LOGIN_SUCCESS = 'LOGIN_SUCCESS';
  export const LOGIN_SUCCESS : LOGIN_SUCCESS = 'LOGIN_SUCCESS';

  export type LOGIN_FAILURE = 'LOGIN_FAILURE';
  export const LOGIN_FAILURE : LOGIN_FAILURE = 'LOGIN_FAILURE';

  export type loginSuccessAction = {
    type: LOGIN_SUCCESS,
    username: string,
    userId: string,
    profile: UserProfile,
    logoutUrl: string,
    accountManagementUrl: string,
  };

  export type loginFailureAction = {
    type: LOGIN_FAILURE,
  };

  export function loginSuccess(
    username: string, userId: string,
    profile: UserProfile, logoutUrl: string, accountManagementUrl: string) : loginSuccessAction {

    return {
      type: LOGIN_SUCCESS,
      username,
      userId,
      profile,
      logoutUrl,
      accountManagementUrl,
    };
  }

  export function loginFailure() : loginFailureAction {
    return {
      type: LOGIN_FAILURE,
    };
  }

  export function initAuthenticationProvider() {
    return function (dispatch) {
      initialize(
        (profile, logoutUrl, accountManagementUrl) =>
          dispatch(loginSuccess(
            profile.username, profile.id, profile, logoutUrl, accountManagementUrl)),
        () => dispatch(loginFailure()),
        configuration.protocol + configuration.hostname);
    };
  }

}
