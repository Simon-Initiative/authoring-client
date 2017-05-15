var fetch = (window as any).fetch;

import * as persistence from '../data/persistence';
import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { configuration } from './utils/config';
import { coursesQuery } from '../data/domain';
import guid from '../utils/guid';
const Keycloak = require("keycloak-js");

const kcUrl = configuration.protocol + configuration.hostname;

const keycloakConfig = {
  url: kcUrl + '/auth',
  realm: 'oli_security',
  clientId: 'content_client'
} 

const kc = Keycloak(keycloakConfig);

export module user {
  
  export type LOGIN_SUCCESS = 'LOGIN_SUCCESS';
  export const LOGIN_SUCCESS : LOGIN_SUCCESS = 'LOGIN_SUCCESS';
  
  export type LOGIN_FAILURE = 'LOGIN_FAILURE';
  export const LOGIN_FAILURE : LOGIN_FAILURE = 'LOGIN_FAILURE';

  export type loginSuccessAction = {
    type: LOGIN_SUCCESS,
    username: string,
    userId: string,
    profile: Object,
    logoutUrl: string,
    accountManagementUrl: string
  }

  export type loginFailureAction = {
    type: LOGIN_FAILURE
  }

  export function loginSuccess(username: string, userId: string,
    profile: Object, logoutUrl: string, accountManagementUrl: string) : loginSuccessAction {
    return {
      type: LOGIN_SUCCESS,
      username,
      userId,
      profile,
      logoutUrl,
      accountManagementUrl
    }
  }

  export function loginFailure() : loginFailureAction {
    return {
      type: LOGIN_FAILURE
    }
  }

  export function initAuthenticationProvider() {
    return function(dispatch) {

      kc.init({onLoad: 'login-required', checkLoginIframe: false}).success(authenticated => {
        if (authenticated) {

          // Once we are authenticationed, store the token so that it can 
          // be injected into the headers of outgoing API HTTP requests
          credentials.token = kc.token;

          // Also, request asynchronously the user's profile from keycloak
          kc.loadUserProfile().success(function(profile) {

            const logoutUrl = kc.createLogoutUrl({redirectUri: kcUrl});
            const accountManagementUrl = kc.createAccountUrl();

            dispatch(loginSuccess(profile.username, profile.id, profile, logoutUrl, accountManagementUrl));
          
          }).error(function() {
            dispatch(loginFailure());
          });
          
        } else {
          
          kc.login({redirectUri: kcUrl});
        }
      });

      // Listen for token expiration and update said token when it does expire
      kc.onTokenExpired = () => {
        kc.updateToken(5).success(function(refreshed) {

          if (refreshed) {
            credentials.token = kc.token;
            console.log('Token was successfully refreshed');
          } else {
            console.log('Token is still valid');
          }
        }).error(function() {
            console.log('Failed to refresh the token, or the session has expired');
        });
      };

    }
  }

}
