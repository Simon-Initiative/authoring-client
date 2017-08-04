import { AbstractCommand } from './command';
import * as Immutable from 'immutable';
import * as models from '../../../../data/models';
import * as t from '../../../../data/contentTypes';

import { removeNode } from '../utils';

export class RemoveCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel, 
    node: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services) : Promise<models.OrganizationModel> {
    
    return Promise.resolve(removeNode(org, node.guid));
  }

  description() {
    return 'Remove';
  }
}
