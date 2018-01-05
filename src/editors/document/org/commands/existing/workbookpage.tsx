import { AbstractCommand } from '../command';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';
import { LegacyTypes } from '../../../../../data/types';
import * as persistence from '../../../../../data/persistence';
import ResourceSelection from '../../../../../utils/selection/ResourceSelection';
import createGuid from '../../../../../utils/guid';

import { insertNode } from '../../utils';

export class AddExistingWorkbookPageCommand extends AbstractCommand {

  onInsert(org, parent, context, services, resolve, reject, page) {
   
    services.dismissModal();
    
    const resources = context.courseModel.resources.toArray();
    const found = resources.find(r => r.guid === page.id);
    
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
    context, services) : Promise<models.OrganizationModel> {

    const predicate = (res: persistence.CourseResource) : boolean => 
      res.type === LegacyTypes.workbook_page;
    
    return new Promise((resolve, reject) => {
      services.displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          courseId={context.courseId}
          onInsert={this.onInsert.bind(this, org, parent, context, services, resolve, reject)} 
          onCancel={this.onCancel.bind(this, services)}/>);
    });
  }
}
