import { AbstractCommand } from '../command';
import * as Immutable from 'immutable';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';

import { insertNode } from '../../utils';

export class AddUnitCommand extends AbstractCommand {

  precondition(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include) 
    : boolean {

    if (parent.contentType === t.OrganizationContentTypes.Sequence) {
      return !parent.children.some(
        value => value.contentType === t.OrganizationContentTypes.Module);
    } else {
      return true;
    }

  }

  description(labels: t.Labels) : string {
    return 'Add new ' + labels.unit.toLowerCase();
  }

  execute(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services) : Promise<models.OrganizationModel> {
    
    const node = new t.Unit().with({ title: 'New ' + org.labels.unit });

    return Promise.resolve(insertNode(org, parent.guid, node, (parent as any).children.size));
  }
}
