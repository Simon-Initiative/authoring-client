const fetch = (window as any).fetch;

import * as persistence from '../data/persistence';
import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { configuration } from './utils/config';
import { coursesQuery } from '../data/domain';
import guid from '../utils/guid';


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
  };

  export type loginFailureAction = {
    type: LOGIN_FAILURE,
  };

  export function loginSuccess(
    username: string, userId: string,
    profile: Object) : loginSuccessAction {

    return {
      type: LOGIN_SUCCESS,
      username,
      userId,
      profile,
    };
  }

  export function loginFailure() : loginFailureAction {
    return {
      type: LOGIN_FAILURE,
    };
  }

  export function login(user: string, password: string) {
    return function (dispatch) {

      const requestId = guid();
      dispatch(requestActions.startRequest(requestId, 'Logging In'));

      let userId = null;
      let username = null;

      fetch(`${configuration.baseUrl}/_users/org.couchdb.user:${user}`, {
        method: 'GET',
        headers: getHeaders({ user, password }),
      })
      .then((response) => {

        dispatch(requestActions.endRequest(requestId));

        if (!response.ok) {
          throw new Error('login failed');
        }
        return response.json();
      })
      .then((json) => {
        
        userId = json._id;
        username = json.name;

        credentials.user = user;
        credentials.password = password;

        dispatch(loginSuccess(username, userId, {}));

      })
      .catch((err) => {
        dispatch(requestActions.endRequest(requestId));
        dispatch(loginFailure());
      });  
    };
  }

}
