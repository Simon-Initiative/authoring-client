import { AbstractCommand } from '../command';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';

import { insertNode } from '../../utils';

export class AddSequenceCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services) : Promise<models.OrganizationModel> {
    
    const node = new t.Sequence().with({ title: 'New ' + org.labels.sequence });

    return Promise.resolve(insertNode(org, parent.guid, node, (parent as any).children.size));
  }

  description(labels: t.Labels) : string {
    return labels.sequence;
  }
}
