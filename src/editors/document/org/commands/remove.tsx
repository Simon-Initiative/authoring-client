import { AbstractCommand } from './command';
import * as Immutable from 'immutable';
import { AppServices } from '../../../common/AppServices';
import * as models from '../../../../data/models';
import * as t from '../../../../data/contentTypes';

import ModalPrompt from '../../../../utils/selection/ModalPrompt';

import { removeNode } from '../utils';

export class RemoveCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel, 
    node: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services : AppServices) : Promise<models.OrganizationModel> {
    
    return new Promise((resolve, reject) => {

      const modal = <ModalPrompt 
        text="Are you sure you wish to remove this organization component?"
        onInsert={() => { services.dismissModal(); resolve(removeNode(org, node.guid));}}
        onCancel={() => services.dismissModal()}
        okLabel="Yes"
        cancelLabel="No"
        />;

      services.displayModal(modal);
    });

  }

  description(labels: t.Labels) {
    return 'Remove';
  }
}
