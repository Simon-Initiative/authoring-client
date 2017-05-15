import * as types from "./types";
import {CourseId, DocumentId} from "./types";
import * as models from "./models";
import * as Immutable from "immutable";
import {credentials, getHeaders} from "../actions/utils/credentials";
import {configuration} from "../actions/utils/config";
var fetch = (window as any).fetch;

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
    _courseId?: types.CourseId,
    _id?: types.DocumentId,
    _rev?: RevisionId,
    model?: models.ContentModel
};
const defaultDocumentParams = {
    _courseId: '',
    _id: '',
    _rev: '',
    model: Immutable.Record({modelType: models.EmptyModel})
}

export class Document extends Immutable.Record(defaultDocumentParams) {
    _courseId?: types.CourseId;
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

export function getEditablePackages() {
    return new Promise(function (resolve, reject) {
        fetch(`${configuration.baseUrl}/packages/editable`, {
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
                let courseModels: models.CourseModel[] = json.map(d => {
                    return models.createModel(d);
                });
                resolve(courseModels as models.CourseModel[]);
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function retrieveCoursePackage(courseId: CourseId): Promise<Document> {

    return new Promise(function (resolve, reject) {
        fetch(`${configuration.baseUrl}/packages/${courseId}`, {
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
                    _courseId: courseId,
                    _id: json.guid,
                    _rev: json.rev,
                    model: models.createModel(json)
                }));
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function retrieveDocument(courseId: CourseId, documentId: DocumentId): Promise<Document> {
    if (courseId === null) {
        throw "CourseId cannot be null";
    }
    return new Promise(function (resolve, reject) {
        fetch(`${configuration.baseUrl}/${courseId}/resources/${documentId}`, {
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
                json.courseId = courseId;
                resolve(new Document({
                    _courseId: courseId,
                    _id: json.guid,
                    _rev: json.rev,
                    model: models.createModel(json)
                }));
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function listenToDocument(doc: Document): Promise<Document> {
    console.log("listenToDocument (" + doc._id + ")");
    return new Promise(function (resolve, reject) {

        const params = {
            doc_ids: [doc._id]
        }
        fetch(`${configuration.baseUrl}/polls?timeout=30000&include_docs=true&filter=_doc_ids`, {
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
                if (json.payload !== undefined && json.payload) {
                    resolve(new Document({
                        _courseId: doc._courseId,
                        _id: json.payload.guid,
                        _rev: json.payload.rev,
                        model: models.createModel(json.payload.doc)
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

export function createDocument(content: models.ContentModel,
                               database: string = configuration.database): Promise<Document> {
    console.log("createDocument ()");
    return new Promise(function (resolve, reject) {
        fetch(`${configuration.baseUrl}/${database}`, {
            method: 'POST',
            headers: getHeaders(credentials),
            body: JSON.stringify(content.toPersistence())
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

export function persistDocument(doc: Document): Promise<Document> {
    console.log("persistDocument ()");
    return new Promise(function (resolve, reject) {

        const toPersist = doc.model.toPersistence();

        console.log("Going to persist: " + JSON.stringify(toPersist));

        let url = `${configuration.baseUrl}/${doc._courseId}/resources/${doc._id}`;
        if (doc._courseId === doc._id) {
            url = `${configuration.baseUrl}/packages/${doc._courseId}`;
        }
        fetch(url, {
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
                    _courseId: doc._courseId,
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

export function queryDocuments(query: Object): Promise<Document[]> {
    console.log("queryDocuments (" + JSON.stringify(query) + ")");
    return new Promise(function (resolve, reject) {
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


