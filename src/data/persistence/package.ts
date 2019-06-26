import { authenticatedFetch, Document } from './common';
import { configuration } from '../../actions/utils/config';
import { CourseId } from '../types';
import * as models from '../models';
import { Resource } from '../content/resource';
import { DeployStage } from 'data/models/course.ts';

export function importPackage(repositoryUrl: string): Promise<{}> {

  const url = `${configuration.baseUrl}/packages/import`;
  const body = JSON.stringify({ repositoryUrl });
  const method = 'POST';

  return authenticatedFetch({ url, body, method });
}

export function getEditablePackages(): Promise<models.CourseModel[]> {

  const url = `${configuration.baseUrl}/packages/editable`;

  return authenticatedFetch({ url })
    .then((json: any) => json.map(m => models.createModel(m)));
}

export function retrieveCoursePackage(courseId: CourseId): Promise<Document> {

  const url = `${configuration.baseUrl}/packages/${courseId}/details`;

  return authenticatedFetch({ url })
    .then((json: any) => new Document({
      _courseId: courseId,
      _id: json.guid,
      _rev: json.rev,
      model: models.createModel(json),
    }));
}

export function deleteCoursePackage(courseId: CourseId): Promise<{}> {

  const url = `${configuration.baseUrl}/packages/set/visible?visible=false`;
  const method = 'POST';

  const body = JSON.stringify([courseId]);

  return authenticatedFetch({ url, method, body });
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

export type Theme = {
  id: string,
  location: string,
  default: boolean,
  thumbnail: string,  // The partial url for thumbnail image
  image: string,  // The partial url for the full-size image
};

export function fetchCourseThemes(course: string): Promise<Theme[]> {
  const url = `${configuration.baseUrl}/${course}/themes/available`;
  const method = 'GET';

  return authenticatedFetch({ url, method }) as Promise<Theme[]>;
}

export function setCourseTheme(course: string, theme: string): Promise<{}> {
  const url = `${configuration.baseUrl}/packages/${course}/theme`;
  const method = 'PUT';
  const body = JSON.stringify({ theme });

  return authenticatedFetch({ url, method, body });
}

export function requestDeployment(course: string, stage: DeployStage, redeploy: boolean):
  Promise<{}> {
  const url = `${configuration.baseUrl}/packages/${course}/deploy`;
  const method = 'POST';
  const body = JSON.stringify({ stage, redeploy });

  return authenticatedFetch({ url, method, body });
}

export function createNewVersion(course: string, version: string): Promise<{}> {
  const url = `${configuration.baseUrl}/packages/${course}/new/version`;
  const method = 'POST';

  const body = JSON.stringify({ version });

  return authenticatedFetch({ url, method, body });
}
