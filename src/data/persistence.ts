
var fetch = (window as any).fetch;

import * as models from './models';
import * as types from './types';
import * as Immutable from 'immutable';
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

export type DocumentParams = {
  _id?: types.DocumentId,
  _rev?: RevisionId,
  model?: models.ContentModel
};
const defaultDocumentParams = {
  _id: '',
  _rev: '',
  model: Immutable.Record({ modelType: models.EmptyModel})
}

export class Document extends Immutable.Record(defaultDocumentParams) {
    
  _id: types.DocumentId;
  _rev: RevisionId;
  model: models.ContentModel;

  constructor(params?: DocumentParams) {
      params ? super(params) : super();
  }

  with(values: DocumentParams) {
      return this.merge(values) as this;
  }
}

export function queryDocuments(query: Object) : Promise<Document[]> {
  console.log ("queryDocuments ("+JSON.stringify (query)+")");
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
export function listenToDocument(documentId: types.DocumentId) : Promise<Document> {
  console.log ("listenToDocument ("+documentId+")");  
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
          resolve(new Document({
            _id: json.results[0].doc._id,
            _rev: json.results[0].doc._rev,
            model: models.createModel(json.results[0].doc)
          }));
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

export function retrieveDocument(documentId: types.DocumentId) : Promise<Document> {
  console.log ("retrieveDocument ("+documentId+")");  
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
        resolve(new Document({
          _id: json._id,
          _rev: json._rev,
          model: models.createModel(json)
        }));
      })
      .catch(err => {
        reject(err);
      });
  });      
}

export function createDocument(content: models.ContentModel, 
  database : string = configuration.database) : Promise<Document> {
  console.log ("createDocument ()");  
  return new Promise(function(resolve, reject) {
    fetch(`${configuration.baseUrl}/${database}`, {
        method: 'POST',
        headers: getHeaders(credentials),
        body: JSON.stringify(content.toJS())
      })
    .then(response => {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      resolve(new Document({
          _id: json.id,
          _rev: json.rev,
          model: content
        }));
    })
    .catch(err => {
      reject(err);
    });
  });
}


export function persistDocument(doc: Document) : Promise<Document> {
  console.log ("persistDocument ()");  
  return new Promise(function(resolve, reject) {

    // We flatten the model during persistence so that the properties of 
    // doc.model actually exist at the top level of the stored document, instead
    // of under 'model'.  This allows for more granular field selection during queries. 
    const toPersist = Object.assign({}, {_id: doc._id, _rev: doc._rev}, doc.model.toJS());

    fetch(`${configuration.baseUrl}/${configuration.database}/${doc._id}`, {
        method: 'PUT',
        headers: getHeaders(credentials),
        body: JSON.stringify(toPersist)
      })
    .then(response => {
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      
      const newDocument = new Document({
        _id: (json as any).id,
        _rev: (json as any).rev,
        model: doc.model
      });

      resolve(newDocument);
    })
    .catch(err => {
      reject(err);
    });
  });
}

