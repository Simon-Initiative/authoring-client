import * as Immutable from 'immutable';
import { CourseId, DocumentId } from '../types';
import * as models from '../models';
import { credentials, getHeaders } from '../../actions/utils/credentials';
import { forceLogin, refreshTokenIfInvalid } from '../../actions/utils/keycloak';

const fetch = (window as any).fetch;

function handleError(err, reject) {
  if (err.message && err.message === 'Unauthorized') {
    forceLogin();
  } else {
    reject(err);
  }
}

export type HttpRequestParams = {
  method?: string,
  url: string,
  body?: string | FormData,
  headers?: Object,
  query?: Object,
  hasTextResult?: boolean,
};

export function authenticatedFetch(params: HttpRequestParams) {

  const method = params.method ? params.method : 'GET';
  const headers = params.headers ? params.headers : getHeaders(credentials);
  const hasTextResult = params.hasTextResult ? params.hasTextResult : false;

  const { body, url, query } = params;

  let queryString = '';
  if (query && Object.keys(query).length > 0) {
    // convert query params to encoded url string
    queryString = '?' + Object.keys(query)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
      .join('&');
  }

  return new Promise((resolve, reject) => {

    refreshTokenIfInvalid()
      .then((tokenIsValid) => {

        if (!tokenIsValid) {
          forceLogin();
          return;
        }

        return fetch(url + queryString, {
          method,
          headers,
          body,
        });
      })
      .then((response) => {
        if (!response.ok) {
          reject(response.statusText);
        } else {
          resolve(hasTextResult ? response.text() : response.json());
        }
      })
      .catch((err) => {
        handleError(err, reject);
      });

  });

}

export type RevisionId = string;

export type DocumentParams = {
  _courseId?: CourseId,
  _id?: DocumentId,
  _rev?: RevisionId,
  model?: models.ContentModel,
};

const defaultDocumentParams = {
  _courseId: '',
  _id: '',
  _rev: '',
  model: Immutable.Record({ modelType: models.EmptyModel }),
};

export class Document extends Immutable.Record(defaultDocumentParams) {

  /* tslint:disable */
  _courseId?: CourseId;
  _id: DocumentId;
  _rev: RevisionId;
  /* tslint:enable */

  model: models.ContentModel;

  constructor(params?: DocumentParams) {
    params ? super(params) : super();
  }

  with(values: DocumentParams) {
    return this.merge(values) as this;
  }
}
