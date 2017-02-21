
var fetch = (window as any).fetch;

import { credentials, getHeaders } from '../actions/utils/credentials';
import { configuration } from '../actions/utils/config';
import guid from '../utils/guid';

export type Ok = '200';
export type Accepted = '201';
export type BadRequest = '400';
export type Unauthorized = '401';
export type NotFound = '404';
export type Conflict = '409';
export type InternalServerError = '500';

export type StatusCode = Ok | Accepted | BadRequest | Unauthorized | NotFound | Conflict | InternalServerError;

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

export type PendingDocument = { 
  metadata: DocumentMetadata,
  content: Object  
};


export function queryDocuments(query: Object) : Promise<Document[]> {
  return new Promise(function(resolve, reject) {
    fetch(`${configuration.baseUrl}/${configuration.database}/_find`, {
        method: 'POST',
        headers: getHeaders(credentials),
        body: JSON.stringify(query)
      })
    .then(response => {

      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      resolve(json.docs as Document[]);
    })
    .catch(err => {
      reject(err);
    });
  });      
}

export function retrieveDocument(documentId: string) : Promise<Document> {
  return new Promise(function(resolve, reject) {
    fetch(`${configuration.baseUrl}/${configuration.database}/${documentId}`, {
        method: 'GET',
        headers: getHeaders(credentials)
      })
      .then(response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
      })
      .then(json => {
        resolve(json as Document);
      })
      .catch(err => {
        reject(err);
      });
  });      
}

export type PersistSuccess = {
  id: string,
  rev: string,
  ok: boolean
}

export function createDocument(doc: PendingDocument) : Promise<PersistSuccess> {
  return new Promise(function(resolve, reject) {
    fetch(`${configuration.baseUrl}/${configuration.database}`, {
        method: 'POST',
        headers: getHeaders(credentials),
        body: JSON.stringify(doc)
      })
    .then(response => {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      resolve(json as PersistSuccess);
    })
    .catch(err => {
      reject(err);
    });
  });
}

export function createDocumentWithId(id: string, doc: PendingDocument) : Promise<PersistSuccess> {
  return new Promise(function(resolve, reject) {
    fetch(`${configuration.baseUrl}/${configuration.database}/${id}`, {
        method: 'PUT',
        headers: getHeaders(credentials),
        body: JSON.stringify(doc)
      })
    .then(response => {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      resolve(json as PersistSuccess);
    })
    .catch(err => {
      reject(err);
    });
  });
}

export function persistDocument(documentId: string, doc: Document) : Promise<PersistSuccess> {
  return new Promise(function(resolve, reject) {
    fetch(`${configuration.baseUrl}/${configuration.database}/${doc._id}`, {
        method: 'PUT',
        headers: getHeaders(credentials),
        body: JSON.stringify(doc)
      })
    .then(response => {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      resolve(json as PersistSuccess);
    })
    .catch(err => {
      reject(err);
    });
  });
}
