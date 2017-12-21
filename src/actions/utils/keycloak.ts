import { UserProfile } from 'types/user';
import { credentials, getHeaders } from './credentials';
import { configuration } from './config';
const keyCloak = require('keycloak-js');

export type LoginSuccessCallback =
  (profile: UserProfile, logoutUrl: string, managementUrl: string) => void;

const keycloakConfig = {
  url: configuration.protocol + configuration.hostname + '/auth',
  realm: 'oli_security',
  clientId: 'content_client',
};

let kc = null;
let onLoginFailure = null;
let onLoginSuccess : LoginSuccessCallback = null;
let redirectUri = null;

export function initialize(
  onLoginSuccessFunc : LoginSuccessCallback, onLoginFailureFunc, redirectUriStr) {

  onLoginFailure = onLoginFailureFunc;
  onLoginSuccess = onLoginSuccessFunc;
  redirectUri = redirectUriStr;

  login();
}

export function forceLogin() {
  (window as any).location = configuration.protocol + configuration.hostname;
}

export function login() {

  kc = keyCloak(keycloakConfig);

  kc.init({ onLoad: 'login-required', checkLoginIframe: false }).success((authenticated) => {
    if (authenticated) {

      // Once we are authenticationed, store the token so that it can
      // be injected into the headers of outgoing API HTTP requests
      credentials.token = kc.token;

      // Also, request asynchronously the user's profile from keycloak
      kc.loadUserProfile().success((profile: UserProfile) => {

        const logoutUrl = kc.createLogoutUrl({ redirectUri });
        const accountManagementUrl = kc.createAccountUrl();

        continuallyRefreshToken();

        onLoginSuccess(profile, logoutUrl, accountManagementUrl);

      }).error(() => onLoginFailure());

    } else {
      // Requires inserting "http://<hostname>/*" in the Valid Redirect URIs entry
      // of the Content_client settings in the KeyCloak admin UI
      kc.login({ redirectUri });
    }
  });

}

function continuallyRefreshToken() {
  setTimeout(
    () => {
      refreshTokenIfInvalid(60)
        .then(validToken => validToken ? continuallyRefreshToken() : forceLogin());
    },
    30000);
}

const WITHIN_FIVE_SECONDS = 5;

export function refreshTokenIfInvalid(within: number = WITHIN_FIVE_SECONDS) : Promise<any> {

  if (kc.isTokenExpired(within)) {
    return new Promise((resolve, reject) => {
      kc.updateToken(within).success((refreshed) => {
        if (refreshed) {
          credentials.token = kc.token;
          resolve(true);
        } else {
          resolve(true);
        }
      }).error(() => {
        resolve(false);
      });
    });
  }

  return Promise.resolve(true);
}

export function hasRole(role: string) : boolean {
  const WITHIN_FIVE_SECONDS = 5;
  if (kc.isTokenExpired(WITHIN_FIVE_SECONDS)) {
    return false;
  }
  return kc.hasRealmRole(role);
}

