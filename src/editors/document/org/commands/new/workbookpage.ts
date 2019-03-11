import { AbstractCommand } from '../command';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';
import createGuid from '../../../../../utils/guid';
import { createResource } from './create';
import * as o from 'data/models/utils/org';
import { Maybe } from 'tsmonad';
import { NEW_PAGE_CONTENT } from 'data/models/workbook';

export class CreateNewWorkbookPageCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch): Promise<o.OrgChangeRequest> {

    const resource = models.WorkbookPageModel.createNew(
      createGuid(), 'New Page', NEW_PAGE_CONTENT);

    return new Promise((resolve, reject) => {
      createResource(courseModel.guid, resource, dispatch)
        .then((doc) => {
          const id = createGuid();
          if (doc.model.modelType === models.ModelTypes.WorkbookPageModel) {
            const resourceref = new t.ResourceRef().with({ idref: doc.model.resource.id });
            const item = new t.Item().with({ resourceref, id });

            const cr = o.makeAddNode(parent.id, item, Maybe.nothing());
            resolve(cr);
          }
        });
    });

  }

  description(labels: t.Labels): string {
    return 'Page';
  }
}
