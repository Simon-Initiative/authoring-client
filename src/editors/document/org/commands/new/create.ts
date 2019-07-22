import * as persistence from 'data/persistence';
import * as courseActions from 'actions/course';
import * as Immutable from 'immutable';
import { Resource } from 'data/content/resource';
import { CourseIdVers } from 'data/types';
import * as models from 'data/models';
import * as t from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import { AbstractCommand } from 'editors/document/org/commands/command';
import * as o from 'data/models/utils/org';

export function createResource(
  courseId: CourseIdVers, resource, dispatch): Promise<persistence.Document> {

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

export class AddContainerCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch) {
    return Promise.reject();
    // return o.addContainer(org, parent.id).caseOf({
    //   just: cr => Promise.resolve(cr),
    //   nothing: () => Promise.reject(),
    // });
  }


  description(labels: t.Labels): string {
    return labels.sequence;
  }
}
