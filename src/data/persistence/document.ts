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
  courseId: CourseId, documentId: DocumentId): Promise<Document> {

  const url = `${configuration.baseUrl}/${courseId}/resources/${documentId}`;

  return authenticatedFetch({ url })
    .then((json : any) => {
      json.courseId = courseId;
      return new Document({
        _courseId: courseId,
        _id: json.guid,
        _rev: json.rev,
        model: models.createModel(json),
      });
    });
}



export interface PreviewNotSetUp {
  type: 'PreviewNotSetUp';
  message: string[];
}

export interface PreviewSuccess {
  type: 'PreviewSuccess';
  admitCode: string;
  sectionUrl: string;
  activityUrl: string;
}

// Previewing can result in one of two responses from the server
export type PreviewResult = PreviewSuccess | PreviewNotSetUp;

/**
 * Initiates a resource preview.
 * @param courseId the course guid
 * @param documentId the document guid to preview
 */
export function initiatePreview(
  courseId: CourseId, documentId: DocumentId): Promise<PreviewResult> {

  const url = `${configuration.baseUrl}/${courseId}/resources/preview/${documentId}`;

  return authenticatedFetch({ url })
    .then((json : any) => {

      if (json.message !== undefined) {
        return {
          type: 'PreviewNotSetUp',
          message: json.message as string[],
        } as PreviewNotSetUp;
      }
      const { admitCode, sectionUrl, activityUrl } = json;
      return {
        admitCode,
        sectionUrl,
        activityUrl,
        type: 'PreviewSuccess',
      } as PreviewSuccess;
    });
}

export function bulkFetchDocuments(
  courseId: string, filters: string[], action: string): Promise<Document[]> {

  // Valid values for 'action' is limited to 'byIds' or 'byTypes'
  const url = `${configuration.baseUrl}/${courseId}/resources/bulk?action=${action}`;
  const body = JSON.stringify(filters);
  const method = 'POST';

  return authenticatedFetch({ url, body, method })
    .then((json : any) => {
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

export function createDocument(courseId: CourseId,
                               content: models.ContentModel): Promise<Document> {

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
