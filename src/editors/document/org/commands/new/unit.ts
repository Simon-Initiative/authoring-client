import { AbstractCommand } from '../command';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';

import * as o from 'data/models/utils/org';
import { Maybe } from 'tsmonad';

export class AddUnitCommand extends AbstractCommand {

  precondition(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item)
    : boolean {

    if (parent.contentType === t.OrganizationContentTypes.Sequence) {
      return !parent.children.some(
        value => value.contentType === t.OrganizationContentTypes.Module);
    }

    return true;
  }

  description(labels: t.Labels): string {
    return labels.unit;
  }

  execute(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch): Promise<o.OrgChangeRequest> {

    const node = new t.Unit().with({ title: 'New ' + org.labels.unit });
    const cr = o.makeAddNode(parent.id, node, Maybe.nothing());
    return Promise.resolve(cr);
  }
}
