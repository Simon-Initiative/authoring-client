import { AbstractCommand } from './command';
import * as models from '../../../../data/models';
import * as t from '../../../../data/contentTypes';

import ModalPrompt from '../../../../utils/selection/ModalPrompt';

import * as o from 'data/models/utils/org';

export class RemoveCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel,
    node: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void): Promise<o.OrgChangeRequest> {

    // Prompt the user to confirm the removal if the node in question has sub components

    const anyNode = node as any;
    if (anyNode.children !== undefined && anyNode.children.size > 0) {

      return new Promise((resolve, reject) => {

        const text = 'Are you sure you wish to remove this '
          + 'organization component?';

        const modal = <ModalPrompt
          text={text}
          onInsert={() => { dismissModal(); resolve(o.makeRemoveNode(node.id)); }}
          onCancel={() => dismissModal()}
          okLabel="Yes"
          cancelLabel="No"
        />;

        displayModal(modal);
      });

    }

    return Promise.resolve(o.makeRemoveNode(node.id));
  }

  description(labels: t.Labels) {
    return 'Remove';
  }
}
