import { AbstractCommand } from '../command';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';

import * as o from 'data/models/utils/org';


export class AddContainerCommand extends AbstractCommand {

  precondition(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item)
    : boolean {

    return true;
  }

  description(labels: t.Labels): string {
    return 'Container';
  }

  execute(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch): Promise<o.OrgChangeRequest> {

    return Promise.resolve(o.makeAddContainer(parent.id));
  }
}
