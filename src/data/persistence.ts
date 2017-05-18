
import { CourseId, DocumentId } from './types';
import * as models from './models';
import * as Immutable from 'immutable';
import { credentials, getHeaders, getFormHeaders } from '../actions/utils/credentials';
import { configuration } from '../actions/utils/config';
import { Resource } from './resource';

const fetch = (window as any).fetch;

export type Ok = '200';
export type Accepted = '201';
export type BadRequest = '400';
export type Unauthorized = '401';
export type NotFound = '404';
export type Conflict = '409';
export type InternalServerError = '500';

export type StatusCode = Ok | Accepted | BadRequest 
  | Unauthorized | NotFound | Conflict | InternalServerError;

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

export function getEditablePackages() : Promise<models.CourseModel[]> {
  return new Promise((resolve, reject) => {
    fetch(`${configuration.baseUrl}/packages/editable`, {
      method: 'GET',
      headers: getHeaders(credentials),
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((json) => {
      const courseModels: models.CourseModel[] = json.map((d) => {
        return models.createModel(d);
      });
      resolve(courseModels as models.CourseModel[]);
    })
    .catch(err => reject(err));
  });
}

export function retrieveCoursePackage(courseId: CourseId): Promise<Document> {

  return new Promise((resolve, reject) => {
    fetch(`${configuration.baseUrl}/packages/${courseId}`, {
      method: 'GET',
      headers: getHeaders(credentials),
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((json) => {
      resolve(new Document({
        _courseId: courseId,
        _id: json.guid,
        _rev: json.rev,
        model: models.createModel(json),
      }));
    })
    .catch(err => reject(err));
  });
}

export function retrieveDocument(courseId: CourseId, documentId: DocumentId): Promise<Document> {
  if (courseId === null) {
    throw 'courseId cannot be null';
  }
  return new Promise((resolve, reject) => {
    fetch(`${configuration.baseUrl}/${courseId}/resources/${documentId}`, {
      method: 'GET',
      headers: getHeaders(credentials),
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((json) => {
      json.courseId = courseId;
      resolve(new Document({
        _courseId: courseId,
        _id: json.guid,
        _rev: json.rev,
        model: models.createModel(json),
      }));
    })
    .catch(err => reject(err));
  });
}

export function listenToDocument(doc: Document): Promise<Document> {
  
  return new Promise((resolve, reject) => {

    const params = {
      doc_ids: [doc._id],
    };
    fetch(`${configuration.baseUrl}/polls?timeout=30000&include_docs=true&filter=_doc_ids`, {
      method: 'POST',
      headers: getHeaders(credentials),
      body: JSON.stringify(params),
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((json) => {
      if (json.payload !== undefined && json.payload) {
        resolve(new Document({
          _courseId: doc._courseId,
          _id: json.payload.guid,
          _rev: json.payload.rev,
          model: models.createModel(json.payload.doc),
        }));
      } else {
        reject('empty');
      }
    })
    .catch(err => reject(err));
  });
}

export function createDocument(
  courseId: CourseId, content: models.ContentModel): Promise<Document> {
    
  let url = null;
  if (content.type === 'x-oli-package') {
    url = `${configuration.baseUrl}/packages/`;
  } else {
    url = `${configuration.baseUrl}/${courseId}/resources?resourceType=${content.type}`;
  }

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      headers: getHeaders(credentials),
      body: JSON.stringify(content.toPersistence()),
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((json) => {
      const packageGuid = content.type === 'x-oli-package' ? json.guid : courseId;
      resolve(new Document({
        _courseId: packageGuid,
        _id: json.guid,
        _rev: json.rev,
        model: content,
      }));
    })
    .catch(err => reject(err));
  });
}

export function persistDocument(doc: Document): Promise<Document> {
    
  return new Promise((resolve, reject) => {

    const toPersist = doc.model.toPersistence();

    let url = `${configuration.baseUrl}/${doc._courseId}/resources/${doc._id}`;
    if (doc._courseId === doc._id) {
      url = `${configuration.baseUrl}/packages/${doc._courseId}`;
    }
    fetch(url, {
      method: 'PUT',
      headers: getHeaders(credentials),
      body: JSON.stringify(toPersist),
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((json) => {

      const newDocument = new Document({
        _courseId: doc._courseId,
        _id: json.guid,
        _rev: json.rev,
        model: doc.model,
      });

      resolve(newDocument);
    })
    .catch(err => reject(err));
  });
}

/**
 * Uploads a file, receives a promise to deliver path on server 
 * that the file is being stored as. Rejects if the file name conflicts
 * with another file.
 */
export function createWebContent(
  courseId: string, file) : Promise<string> {
  
  return new Promise((resolve, reject) => {

    const url = `${configuration.baseUrl}/${courseId}/webcontents/upload`;
    
    const formData = new FormData();
    formData.append('file', file);

    fetch(url, {
      method: 'POST',
      headers: getFormHeaders(credentials),
      body: formData,
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then((json) => {
      resolve(json.path);
    })
    .catch(err => reject(err));
  });
}

export type CourseResource = {
  _id: string,
  title: string,
  type: string,
};

export function fetchCourseResources(courseId: string) : Promise<CourseResource[]> {
  return new Promise((resolve, reject) => {
    retrieveCoursePackage(courseId)
    .then((doc) => {
      switch (doc.model.modelType) {
        case 'CourseModel':
          return doc.model.resources.toArray().map(
            (r : Resource) => ({ _id: r.id, title: r.title, type: r.type }));
        default:
      }
    })
    .catch(err => reject(err));
  });
  
}
