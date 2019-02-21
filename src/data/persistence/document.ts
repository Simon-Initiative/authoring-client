import { authenticatedFetch, Document } from './common';
import { configuration } from '../../actions/utils/config';
import { CourseId, DocumentId, LegacyTypes } from '../types';
import * as models from '../models';

/**
 * Retrieve a document, given a course and document id.
 * @param courseId the course guid
 * @param documentId the document guid
 */
export function retrieveDocument(
  courseId: CourseId, documentId: DocumentId, notify?: () => void): Promise<Document> {

  const url = `${configuration.baseUrl}/${courseId}/resources/${documentId}`;

  return authenticatedFetch({ url })
    .then((json: any) => {
      json.courseId = courseId;
      return new Document({
        _courseId: courseId,
        _id: json.guid,
        _rev: json.rev,
        model: models.createModel(json, notify),
      });
    });
}



export interface PreviewNotSetUp {
  type: 'PreviewNotSetUp';
  message: string;
}

export interface PreviewPending {
  type: 'PreviewPending';
  message: string;
}

export interface MissingFromOrganization {
  type: 'MissingFromOrganization';
  message: string;
}

export interface PreviewSuccess {
  type: 'PreviewSuccess';
  message: string;
  admitCode: string;
  sectionUrl: string;
  activityUrl: string;
}

export enum ServerName {
  dev,
  qa,
  prod,
}

// Previewing can result in one of these responses from the server
export type PreviewResult =
  PreviewSuccess | PreviewNotSetUp | MissingFromOrganization | PreviewPending;

/**
 * Initiates a resource preview.
 * @param courseId the course guid
 * @param documentId the document guid to preview
 */
export function initiatePreview(
  courseId: CourseId, documentId: DocumentId,
  isRefresh: boolean, server?: ServerName): Promise<PreviewResult> {

  const url = `${configuration.baseUrl}/${courseId}/resources/preview/${documentId}`
    + '?redeploy=true'
    + (isRefresh ? '&refresh=true' : '')
    + (server ? '&server=' + server : '');

  return authenticatedFetch({ url })
    .then((json: any) => {

      const message = json.message !== undefined ? json.message : '';
      const admitCode = json.admitCode !== undefined ? json.admitCode : '';

      if (json.message === 'pending' && admitCode === '') {
        return {
          type: 'PreviewPending',
          message,
        } as PreviewPending;
      }
      if (json.admitCode !== '') {
        const { sectionUrl, activityUrl } = json;

        return {
          message,
          admitCode,
          sectionUrl,
          activityUrl,
          type: 'PreviewSuccess',
        } as PreviewSuccess;
      }
      if (json.message === 'missing') {
        return {
          type: 'MissingFromOrganization',
          message,
        } as MissingFromOrganization;
      }
      return {
        type: 'PreviewNotSetUp',
        message,
      } as PreviewNotSetUp;
    });
}

export function initiateQuickPreview(courseId: CourseId, documentId: DocumentId) {
  const protocol = window.location.protocol + '//';
  const hostname = window.location.host;
  const prefix = 'content-service/api';
  const src = `${protocol + hostname}/${prefix}/${courseId}/resources/quick_preview/${documentId}`;
  window.open(src, '_blank');

  // Temporarily commenting out until authenticated preview is supported in backend.
  // const iframe = document.createElement('iframe');
  // iframe.src = src;
  // // Styles to make the iframe take up the full window
  // const stylesString = `
  //   position:fixed;
  //   top:0px;
  //   left:0px;
  //   bottom:0px;
  //   right:0px;
  //   width:100%;
  //   height:100%;
  //   border:none;
  //   margin:0;
  //   padding:0;
  //   overflow:hidden;
  //   z-index:999999;`;
  // iframe.setAttribute('style', stylesString);

  // win.document.body.appendChild(iframe);
}

export function bulkFetchDocuments(
  courseId: string, filters: string[], action: string): Promise<Document[]> {

  // Valid values for 'action' is limited to 'byIds' or 'byTypes'
  const url = `${configuration.baseUrl}/${courseId}/resources/bulk?action=${action}`;
  const body = JSON.stringify(filters);
  const method = 'POST';

  return authenticatedFetch({ url, body, method })
    .then((json: any) => {
      const documents = [];
      if (json instanceof Array) {
        json.forEach(item => documents.push(new Document({
          _courseId: courseId,
          _id: item.guid,
          _rev: item.rev,
          model: models.createModel(item),
        })));
      } else {
        documents.push(new Document({
          _courseId: courseId,
          _id: json.guid,
          _rev: json.rev,
          model: models.createModel(json),
        }));
      }
      return documents;
    });
}

export function listenToDocument(doc: Document): Promise<Document> {

  const url = `${configuration.baseUrl}/polls?timeout=30000&include_docs=true&filter=_doc_ids`;
  const method = 'POST';
  const params = {
    doc_ids: [doc._id],
  };
  const body = JSON.stringify(params);

  return (authenticatedFetch({ url, body, method }) as any)
    .then((json) => {
      if (json.payload !== undefined && json.payload) {
        return new Document({
          _courseId: doc._courseId,
          _id: json.payload.guid,
          _rev: json.payload.rev,
          model: models.createModel(json.payload.doc),
        });
      }
      return null;
    });
}

export function createDocument(courseId: CourseId, content: models.ContentModel):
  Promise<Document> {

  let url = null;
  if (content.type === LegacyTypes.package) {
    url = `${configuration.baseUrl}/packages/`;
  } else {
    url = `${configuration.baseUrl}/${courseId}/resources?resourceType=${content.type}`;
  }
  const body = JSON.stringify(content.toPersistence());
  const method = 'POST';

  return (authenticatedFetch({ url, body, method }) as any)
    .then((json) => {
      const packageGuid = (content as any).type === LegacyTypes.package ? json.guid : courseId;
      return new Document({
        _courseId: packageGuid,
        _id: json.guid,
        _rev: json.rev,
        model: models.createModel(json),
      });
    });
}

export function persistDocument(doc: Document): Promise<Document> {

  let url = null;
  if ((doc.model as any).type === LegacyTypes.package) {
    url = `${configuration.baseUrl}/packages/${doc._courseId}`;
  } else {
    url = `${configuration.baseUrl}/${doc._courseId}/resources/${doc._id}`;
  }

  try {

    const toPersist = doc.model.toPersistence();
    const body = JSON.stringify(toPersist);
    const method = 'PUT';

    return (authenticatedFetch({ url, body, method }) as any)
      .then((json) => {
        const newDocument = new Document({
          _courseId: doc._courseId,
          _id: json.guid,
          _rev: json.rev,
          model: doc.model,
        });

        return newDocument;
      });
  } catch (err) {
    return Promise.reject(err);
  }
}


export function persistRevisionBasedDocument(
  doc: Document, nextRevision: string): Promise<Document> {

  const br = (doc as any).model.resource.lastRevisionGuid;
  const url
    = `${configuration.baseUrl}/${doc._courseId}/resources/${doc._id}/${br}/${nextRevision}`;

  try {
    const toPersist = doc.model.toPersistence();
    const body = JSON.stringify(toPersist);
    const method = 'PUT';

    return (authenticatedFetch({ url, body, method }) as any)
      .then((json) => {
        const newDocument = new Document({
          _courseId: doc._courseId,
          _id: json.guid,
          _rev: json.rev,
          model: doc.model,
        });

        return newDocument;
      });
  } catch (err) {
    return Promise.reject(err);
  }
}
