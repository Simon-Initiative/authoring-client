var fetch = (window as any).fetch;

import { persistence } from './persistence';
import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { configuration } from './utils/config';
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
    availableCourses: Object[]
  }

  export type loginFailureAction = {
    type: LOGIN_FAILURE
  }

  export function loginSuccess(username: string, userId: string,
    profile: Object, availableCourses: Object[]) : loginSuccessAction {
    return {
      type: LOGIN_SUCCESS,
      username,
      userId,
      profile,
      availableCourses
    }
  }

  export function loginFailure() : loginFailureAction {
    return {
      type: LOGIN_FAILURE
    }
  }

  export function login(user: string, password: string) {
    return function(dispatch) {

      const requestId = guid();
      dispatch(requestActions.startRequest(requestId, 'Logging In'));

      let userId = null;
      let username = null;

      let query = {
        selector: {
          'doc.name': {'$eq': user},
          'doc.type': {'$eq': 'user'}
        }
      };

      fetch(`${configuration.baseUrl}/_users/_find`, {
        method: 'POST',
        headers: getHeaders({ user, password}),
        body: JSON.stringify(query)
      })
      .then(response => {

        dispatch(requestActions.endRequest(requestId));

        if (!response.ok) {
          throw new Error('login failed');
        }
        return response.json();
      })
      .then(json => {
        if (json.docs.length === 1) {
          userId = json.docs[0]._id;
          username = json.docs[0].doc.name;

          // fetch the courses that the user has access to
          let coursesQuery = {
            selector: {
              'content.userId': {'$eq': userId},
              'metadata.type': {'$eq': 'coursePermission'}
            }
          }
          persistence.queryDocuments(coursesQuery, 'Retrieving courses',
            (docs) => {
              let courses = docs.map(result => (result.content as any).courseId);
              dispatch(loginSuccess(username,userId, {}, courses));
            },
            (failure) => {
              dispatch(loginFailure());
          });

        } else {
          dispatch(loginFailure());
        }
      })
      .catch(err => {
        dispatch(requestActions.endRequest(requestId));
        dispatch(loginFailure());
      });  
    }
  }

}
