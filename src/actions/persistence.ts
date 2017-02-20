
var fetch = (window as any).fetch;

import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { configuration } from './utils/config';
import guid from '../utils/guid';

export type Ok = '200';
export type Accepted = '201';
export type BadRequest = '400';
export type Unauthorized = '401';
export type NotFound = '404';
export type Conflict = '409';
export type InternalServerError = '500';

export type StatusCode = Ok | Accepted | BadRequest | Unauthorized | NotFound | Conflict | InternalServerError;

export module persistence {

  export type DocumentMetadata = {
    lockedBy: string,
    type: string
  }

  export type Document = { 
    _id: string,
    _rev: string,
    metadata: DocumentMetadata,
    content: Object  
  };

  export type QuerySuccessCallback = (documents: Document[]) => void;
  
  export const queryDocuments = function(
    query: Object,
    taskDescription: string,
    onSuccess: QuerySuccessCallback, 
    onFailure: RequestFailureCallback) {

    return function(dispatch) {

      const requestId = guid();
      dispatch(requestActions.startRequest(requestId, taskDescription));

      fetch(`${configuration.baseUrl}/${configuration.database}/_find`, {
        method: 'POST',
        headers: getHeaders(credentials),
        body: JSON.stringify(query)
      })
      .then(response => {

        if (!response.ok) {
            throw Error(response.statusText);
        }
        dispatch(requestActions.endRequest(requestId));

        return response.json();
      })
      .then(json => {
        if (onSuccess !== undefined) {
          onSuccess((json.docs as Document[]));
        }
      })
      .catch(err => {

        dispatch(requestActions.endRequest(requestId));

        if (onFailure !== undefined) {
          onFailure({ statusCode: '400', text: err});
        }
      });
    }
  }

  export type RequestFailure = {
    statusCode: StatusCode,
    text: string
  }
  export type RetrieveSuccessCallback = (success: Document) => void;
  export type RequestFailureCallback = (failure: RequestFailure) => void;




  export const retrieveDocument = function(
    documentId: string,
    taskDescription: string,
    onSuccess: RetrieveSuccessCallback, 
    onFailure: RequestFailureCallback) {

    return function(dispatch) {

      const requestId = guid();
      dispatch(requestActions.startRequest(requestId, taskDescription));

      fetch(`${configuration.baseUrl}/${configuration.database}/${documentId}`, {
        method: 'GET',
        headers: getHeaders(credentials)
      })
      .then(response => {

        if (!response.ok) {
            throw Error(response.statusText);
        }
        dispatch(requestActions.endRequest(requestId));

        return response.json();
      })
      .then(json => {
        if (onSuccess !== undefined) {
          onSuccess((json as Document));
        }
      })
      .catch(err => {

        dispatch(requestActions.endRequest(requestId));

        if (onFailure !== undefined) {
          onFailure({ statusCode: '400', text: err});
        }
      });
    }
  }


  export type PersistSuccess = { 
    id: string,
    ok: boolean,
    rev: string
  };

  export type PersistFailure = {
    statusCode: StatusCode,
    text: string
  }
  export type PersistSuccessCallback = (cb: PersistSuccess) => void;
  export type PersistFailureCallback = (cb: PersistFailure) => void;


  export const persistDocument = function(
    documentId: string,
    content: Object,
    taskDescription: string,
    onSuccess: PersistSuccessCallback, 
    onFailure: PersistFailureCallback) {

    return function(dispatch) {

      const requestId = guid();
      dispatch(requestActions.startRequest(requestId, taskDescription));

      fetch(`${configuration.baseUrl}/${configuration.database}/${documentId}`, {
        method: 'PUT',
        headers: getHeaders(credentials),
        body: JSON.stringify(content)
      })
      .then(response => {

        if (!response.ok) {
            throw Error(response.statusText);
        }
        dispatch(requestActions.endRequest(requestId));

        return response.json();
      })
      .then(json => {
        if (onSuccess !== undefined) {
          onSuccess((json as PersistSuccess));
        }
      })
      .catch(err => {

        dispatch(requestActions.endRequest(requestId));

        if (onFailure !== undefined) {
          onFailure({ statusCode: '400', text: err});
        }
      });
    }
  }

}
