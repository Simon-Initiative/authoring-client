import * as Immutable from 'immutable';

import { AbstractCommand } from '../command';
import * as models from 'data/models';
import * as t from 'data/contentTypes';
import { LegacyTypes } from 'data/types';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import createGuid from 'utils/guid';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { insertNode } from '../../utils';
import { Resource, ResourceState } from 'data/content/resource';

export class AddExistingWorkbookPageCommand extends AbstractCommand {

  onInsert(org, parent, context, services, resolve, reject, page: Resource) {

    services.dismissModal();

    const resources = context.courseModel.resources.toArray();
    const found = resources.find(r => r.id === page.id);

    const id = createGuid();
    const resourceref = new t.ResourceRef().with({ idref: found.id });
    const item = new t.Item().with({ resourceref, id });

    resolve(insertNode(org, parent.guid, item, parent.children.size));
  }

  onCancel(services) {
    services.dismissModal();
  }

  description() : string {
    return 'Page';
  }

  execute(
    org: models.OrganizationModel,
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context: AppContext,
    services: AppServices) : Promise<models.OrganizationModel> {

    if (parent.contentType === 'Unit' ||
      parent.contentType === 'Section' ||
      parent.contentType === 'Module') {

      type children = t.Module | t.Section | t.Item;
      const resourcesAlreadyInOrg: Immutable.Set<String> = Immutable.Set<String>(
        (parent.children.toArray() as children[])
          .filter(child => child.contentType === 'Item')
          .map(child => context
                          .courseModel
                          .resourcesById
                          .get((child as t.Item).resourceref.idref)
                          .guid));

      const predicate = (res: Resource) : boolean =>
        res.type === LegacyTypes.workbook_page
          && !(res.resourceState === ResourceState.DELETED)
          && !resourcesAlreadyInOrg.has(res.guid);

      return new Promise((resolve, reject) => {
        services.displayModal(
          <ResourceSelection
            filterPredicate={predicate}
            courseId={context.courseId}
            onInsert={this.onInsert.bind(this, org, parent, context, services, resolve, reject)}
            onCancel={this.onCancel.bind(this, services)}/>);
      });
    }

    return Promise.resolve(org);
  }
}
