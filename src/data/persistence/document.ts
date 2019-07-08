import { authenticatedFetch, Document } from './common';
import { configuration } from '../../actions/utils/config';
import { DocumentId, LegacyTypes } from '../types';
import * as models from '../models';
import { CourseIdVers, CourseGuid, ResourceId, ResourceGuid } from 'data/types';

/**
 * Retrieve a document, given a course and document id.
 * @param courseId the course guid
 * @param documentId the document guid
 */
export function retrieveDocument(
  course: CourseGuid | CourseIdVers, documentId: ResourceId | ResourceGuid | CourseGuid,
  notify?: () => void):
  Promise<Document> {

  // tslint:disable-next-line:max-line-length
  const url = `${configuration.baseUrl}/${course.value()}/resources/${documentId.value()}`;

  return authenticatedFetch({ url })
    .then((json: any) => {
      return new Document({
        _courseId: course,
        _id: json.id,
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
  course: CourseGuid | CourseIdVers, documentId: ResourceId | ResourceGuid,
  isRefresh: boolean, server?: ServerName): Promise<PreviewResult> {

  const url = `${configuration.baseUrl}/${course.value()}/resources/preview/${documentId.value()}`
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

export function initiateQuickPreview(course: CourseGuid, documentId: ResourceId | ResourceGuid) {
  const protocol = window.location.protocol + '//';
  const hostname = window.location.host;
  const prefix = 'content-service/api';
  // tslint:disable-next-line:max-line-length
  const src = `${protocol + hostname}/${prefix}/${course.value()}/resources/quick_preview/${documentId.value()}`;
  window.open(src, '_blank');
}

export function bulkFetchDocuments(
  course: CourseGuid | CourseIdVers, filters: string[], action: string): Promise<Document[]> {

  // Valid values for 'action' is limited to 'byIds' or 'byTypes'
  // tslint:disable-next-line:max-line-length
  const url = `${configuration.baseUrl}/${course.value()}/resources/bulk?action=${action}`;
  const body = JSON.stringify(filters);
  const method = 'POST';

  return authenticatedFetch({ url, body, method })
    .then((json: any) => {
      const documents = [];
      if (json instanceof Array) {
        json.forEach(item => documents.push(new Document({
          _courseId: course,
          _id: item.guid,
          _rev: item.rev,
          model: models.createModel(item),
        })));
      } else {
        documents.push(new Document({
          _courseId: course,
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

export function createDocument(course: CourseGuid | CourseIdVers, content: models.ContentModel):
  Promise<Document> {

  // tslint:disable-next-line:max-line-length
  const url = `${configuration.baseUrl}/${course.value()}/resources?resourceType=${content.type}`;
  const body = JSON.stringify(content.toPersistence());
  const method = 'POST';

  return (authenticatedFetch({ url, body, method }) as any)
    .then((json) => {
      return new Document({
        _courseId: course,
        _id: json.id ? json.id : json.guid,
        _rev: json.rev,
        model: models.createModel(json),
      });
    });
}

export function persistDocument(doc: Document): Promise<Document> {
  const course = typeof doc._courseId === 'string'
    ? doc._courseId
    : doc._courseId.value();
  const resource = typeof doc._id === 'string'
    ? doc._id
    : doc._id.value();

  let url = null;
  if (doc.model.type === LegacyTypes.package) {
    url = `${configuration.baseUrl}/packages/${course}`;
  } else {
    url = `${configuration.baseUrl}/${course}/resources/${resource}`;
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
  const course = typeof doc._courseId === 'string'
    ? doc._courseId
    : doc._courseId.value();
  const resource = typeof doc._id === 'string'
    ? doc._id
    : doc._id.value();

  const br = (doc.model as any).resource.lastRevisionGuid;
  const url
    // tslint:disable-next-line:max-line-length
    = `${configuration.baseUrl}/${course}/resources/${resource}/${br}/${nextRevision}`;

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
