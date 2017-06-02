import { credentials, getHeaders } from './credentials';
const keyCloak = require('keycloak-js');


const keycloakConfig = {
  url: 'http://dev.local/auth',
  realm: 'oli_security',
  clientId: 'content_client',
};

let kc = null; 
let onLoginFailure = null;
let onLoginSuccess = null;
let redirectUri = null;

export function initialize(
  onLoginSuccessFunc, onLoginFailureFunc, redirectUriStr) {

  onLoginFailure = onLoginFailureFunc;
  onLoginSuccess = onLoginSuccessFunc;
  redirectUri = redirectUriStr;

  login();
}

export function login() {
  
  kc = keyCloak(keycloakConfig);

  kc.init({ onLoad: 'login-required', checkLoginIframe: false }).success((authenticated) => {
    if (authenticated) {

      // Once we are authenticationed, store the token so that it can 
      // be injected into the headers of outgoing API HTTP requests
      credentials.token = kc.token;

      // Also, request asynchronously the user's profile from keycloak
      kc.loadUserProfile().success((profile) => {

        const logoutUrl = kc.createLogoutUrl({ redirectUri });
        const accountManagementUrl = kc.createAccountUrl();

        onLoginSuccess(profile, logoutUrl, accountManagementUrl);
      
        refreshOnExpiration();

      }).error(() => onLoginFailure());
      
    } else {
      // Requires inserting "http://dev.local/*" in the Valid Redirect URIs entry
      // of the Content_client settings in the KeyCloak admin UI
      kc.login({ redirectUri });
    }
  });

}

function refreshOnExpiration() {
  kc.onTokenExpired = () => {
    kc.updateToken(5).success((refreshed) => {
      if (refreshed) {
        credentials.token = kc.token;
        console.log('Token was successfully refreshed');
      } else {
        console.log('Token is still valid');
      }
    }).error(() => initKeyCloak());
  };
}
