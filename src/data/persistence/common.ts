import * as Immutable from 'immutable';
import { CourseId, DocumentId } from '../types';
import * as models from '../models';
import { credentials, getHeaders, getFormHeaders } from '../../actions/utils/credentials';
import { configuration } from '../../actions/utils/config';
import { Resource } from '../content/resource';
import { UserInfo } from '../content/user_info';
import { isArray } from 'util';

const fetch = (window as any).fetch;

import { forceLogin, refreshTokenIfInvalid } from '../../actions/utils/keycloak';

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
  body?: any,
  headers?: Object,
  hasTextResult?: boolean,
};

export function authenticatedFetch(params: HttpRequestParams) {

  const method = params.method ? params.method : 'GET';
  const headers = params.headers ? params.headers : getHeaders(credentials);
  const hasTextResult = params.hasTextResult ? params.hasTextResult : false;

  const { body, url } = params;

  return new Promise((resolve, reject) => {

    refreshTokenIfInvalid()
    .then((tokenIsValid) => {

      if (!tokenIsValid) {
        forceLogin();
        return;
      }

      return fetch(url, {
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
