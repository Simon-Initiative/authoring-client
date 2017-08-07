import { AbstractCommand } from '../command';
import * as Immutable from 'immutable';
import * as models from '../../../../../data/models';
import { AppServices } from '../../../../common/AppServices';
import * as t from '../../../../../data/contentTypes';
import createGuid from '../../../../../utils/guid';

import { insertNode } from '../../utils';

export class CreateNewWorkbookPageCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services: AppServices) : Promise<models.OrganizationModel> {
    
    return new Promise((resolve, reject) => {
      services.createWorkbookPage('New Workbook Page', context.courseId)
        .then((doc) => {
          const id = createGuid();
          if (doc.model.modelType === models.ModelTypes.WorkbookPageModel) {
            const resourceref = new t.ResourceRef().with({ idref: doc.model.resource.id });
            const item = new t.Item().with({ resourceref, id });
            resolve(insertNode(org, parent.guid, item, (parent as any).children.size));
          }
        });
    });
    
  }

  description(labels: t.Labels) : string {
    return 'Add new workbook page';
  }
}
