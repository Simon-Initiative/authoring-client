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

  description() : string {
    return 'Add new unit';
  }

  execute(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services) : Promise<models.OrganizationModel> {
    
    const node = new t.Unit().with({ title: 'New Unit' });

    return Promise.resolve(insertNode(org, parent.guid, node, (parent as any).children.size));
  }
}
