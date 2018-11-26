import { AbstractCommand } from './command';
import { AppServices } from '../../../common/AppServices';
import * as models from '../../../../data/models';
import * as t from '../../../../data/contentTypes';

import ModalPrompt from '../../../../utils/selection/ModalPrompt';

import { removeNode } from '../utils';

export class RemoveCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel,
    node: t.Sequences | t.Sequence | t.Unit | t.Module | t.Section | t.Item | t.Include,
    context, services: AppServices): Promise<models.OrganizationModel> {

    // Prompt the user to confirm the removal if the node in question has sub components

    const anyNode = node as any;
    if (anyNode.children !== undefined && anyNode.children.size > 0) {

      return new Promise((resolve, reject) => {

        const text = 'Are you sure you wish to remove this '
          + 'organization component?';

        const modal = <ModalPrompt
          text={text}
          onInsert={() => { services.dismissModal(); resolve(removeNode(org, node.guid)); }}
          onCancel={() => services.dismissModal()}
          okLabel="Yes"
          cancelLabel="No"
        />;

        services.displayModal(modal);
      });

    }

    return Promise.resolve(removeNode(org, node.guid));
  }

  description(labels: t.Labels) {
    return 'Remove';
  }
}
