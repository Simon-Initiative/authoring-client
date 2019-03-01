import * as persistence from 'data/persistence';
import * as courseActions from 'actions/course';
import * as Immutable from 'immutable';
import { Resource } from 'data/content/resource';

export function createResource(
  courseId: string, resource, dispatch): Promise<persistence.Document> {

  return new Promise((resolve, reject) => {

    persistence.createDocument(courseId, resource)
      .then((result: persistence.Document) => {

        const r = (result as any).model.resource;
        const updated = Immutable.OrderedMap<string, Resource>([[r.guid, r]]);
        dispatch(courseActions.updateCourseResources(updated));

        resolve(result);

      });
  });
}
