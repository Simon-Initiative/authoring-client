import { AbstractCommand } from '../command';
import * as Immutable from 'immutable';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';

import { insertNode } from '../../utils';

export class AddModuleCommand extends AbstractCommand {

  precondition(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include) 
    : boolean {

    if (parent.contentType === t.OrganizationContentTypes.Sequence) {
      return !parent.children.some(
        value => value.contentType === t.OrganizationContentTypes.Unit);
    } else {
      return true;
    }

  }

  description(labels: t.Labels) : string {
    return labels.module;
  }

  execute(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services) : Promise<models.OrganizationModel> {
    
    const module = new t.Module().with({ title: 'New ' + org.labels.module });

    return Promise.resolve(insertNode(org, parent.guid, module, (parent as any).children.size));
  }
}
