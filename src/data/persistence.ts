
var fetch = (window as any).fetch;

import * as content from './content';
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

export type RevisionId = string;

export type DocumentMetadata = {
  _id: content.DocumentId,
  _rev: RevisionId,
}

export type Document = DocumentMetadata & content.ContentModel

export function copy(document: Document) : Document {
  
  let doc : Document = Object.assign({}, document);
  let copy = Object.assign({}, document);
  
  return copy;
}

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

let since = 'now'
export function listenToDocument(documentId: content.DocumentId) : Promise<Document> {
  return new Promise(function(resolve, reject) {

    const params = {
      doc_ids: [documentId]
    }
    
    fetch(`${configuration.baseUrl}/${configuration.database}/_changes?timeout=30000&include_docs=true&feed=longpoll&since=${since}&filter=_doc_ids`, {
        method: 'POST',
        headers: getHeaders(credentials),
        body: JSON.stringify(params)
      })
      .then(response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
      })
      .then(json => {
        since = json.last_seq;
        if (json.results[0] !== undefined) {
          resolve(json.results[0].doc as Document);
        } else {
          reject('empty');
        }
        
      })
      .catch(err => {
        console.log('listen err: ');
        reject(err);
      });
  });     
}

export function retrieveDocument(documentId: content.DocumentId) : Promise<Document> {
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

export function createDocument(content: content.ContentModel) : Promise<Document> {
  return new Promise(function(resolve, reject) {
    fetch(`${configuration.baseUrl}/${configuration.database}`, {
        method: 'POST',
        headers: getHeaders(credentials),
        body: JSON.stringify(content)
      })
    .then(response => {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      const newDocument : Document = Object.assign({}, {
        _id: (json as any).id,
        _rev: (json as any).rev
      }, content);

      resolve(newDocument);
    })
    .catch(err => {
      reject(err);
    });
  });
}


export function persistDocument(doc: Document) : Promise<Document> {
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
      const savedDocument : Document = Object.assign({}, doc, {
        _id: (json as any).id,
        _rev: (json as any).rev
      });

      resolve(savedDocument);
    })
    .catch(err => {
      reject(err);
    });
  });
}
