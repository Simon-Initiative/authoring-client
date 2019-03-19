
import { AbstractCommand } from '../command';
import * as models from 'data/models';
import * as t from 'data/contentTypes';
import { LegacyTypes } from 'data/types';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import createGuid from 'utils/guid';
import { Resource, ResourceState } from 'data/content/resource';
import * as o from 'data/models/utils/org';
import { Maybe } from 'tsmonad';
import { PLACEHOLDER_ITEM_ID } from 'data/content/org/common';

export class AddExistingWorkbookPageCommand extends AbstractCommand {

  onInsert(org, parent, dismissModal, courseModel, resolve, page: Resource) {

    dismissModal();

    const resources = courseModel.resources.toArray();
    const found = resources.find(r => r.id === page.id);

    const id = createGuid();
    const resourceref = new t.ResourceRef().with({ idref: found.id });
    const item = new t.Item().with({ resourceref, id });

    const cr = o.makeAddNode(parent.id, item, Maybe.nothing());
    resolve(cr);
  }

  onCancel(dismissModal, reject) {
    dismissModal();
    reject();
  }

  description(): string {
    return 'Page';
  }

  execute(
    org: models.OrganizationModel,
    node: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch): Promise<o.OrgChangeRequest> {

    if (node.contentType === 'Unit' ||
      node.contentType === 'Section' ||
      node.contentType === 'Module') {

      const predicate = (res: Resource): boolean =>
        res.id !== PLACEHOLDER_ITEM_ID
        && res.type === LegacyTypes.workbook_page
        && res.resourceState !== ResourceState.DELETED;

      return new Promise((resolve, reject) => {
        displayModal(
          <ResourceSelection
            filterPredicate={predicate}
            courseId={courseModel.guid}
            onInsert={page => this.onInsert(org, node, dismissModal, courseModel, resolve, page)}
            onCancel={() => this.onCancel(dismissModal, reject)} />);
      });
    }

    return Promise.reject({});
  }
}
