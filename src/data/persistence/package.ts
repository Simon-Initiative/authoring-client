import { authenticatedFetch, Document } from './common';
import { configuration } from '../../actions/utils/config';
import { CourseId, DocumentId } from '../types';
import * as models from '../models';
import { Resource } from '../content/resource';

export function importPackage(repositoryUrl: string) : void {

  const url = `${configuration.baseUrl}/packages/import`;
  const body = JSON.stringify({ repositoryUrl });
  const method = 'POST';

  authenticatedFetch({ url, body, method });
}

export function getEditablePackages(): Promise<models.CourseModel[]> {

  const url = `${configuration.baseUrl}/packages/editable`;

  return authenticatedFetch({ url })
    .then((json : any) => json.map(m => models.createModel(m)));
}

export function retrieveCoursePackage(courseId: CourseId): Promise<Document> {

  const url = `${configuration.baseUrl}/packages/${courseId}/details`;

  return authenticatedFetch({ url })
    .then((json : any) => new Document({
      _courseId: courseId,
      _id: json.guid,
      _rev: json.rev,
      model: models.createModel(json),
    }));
}

export function deleteCoursePackage(courseId: CourseId): Promise<string> {

  const url = `${configuration.baseUrl}/packages/${courseId}?remove_src=false`;
  const method = 'DELETE';

  return authenticatedFetch({ url, method })
    .then((json : any) => json.message);
}


export type CourseResource = {
  _id: string,
  title: string,
  type: string,
};

export function fetchCourseResources(courseId: string): Promise<CourseResource[]> {
  return new Promise((resolve, reject) => {

    try {

      retrieveCoursePackage(courseId)
        .then((doc) => {
          switch (doc.model.modelType) {
            case 'CourseModel':
              resolve(doc.model.resources.toArray().map(
                (r: Resource) => ({ _id: r.guid, title: r.title, type: r.type })));
              return;
            default:
          }
        })
        .catch(err => reject(err));
    } catch (err) {
      reject(err);
    }
  });

}


