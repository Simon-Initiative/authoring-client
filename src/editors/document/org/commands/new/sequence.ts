import { AbstractCommand } from '../command';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';

import * as o from 'data/models/utils/org';
import { Maybe } from 'tsmonad';

export class AddSequenceCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch): Promise<o.OrgChangeRequest> {

    const node = new t.Sequence().with({ title: 'New ' + org.labels.sequence });
    const cr = o.makeAddNode(parent.id, node, Maybe.nothing());
    return Promise.resolve(cr);
  }

  description(labels: t.Labels): string {
    return labels.sequence;
  }
}
