import { AbstractCommand } from '../command';
import * as models from 'data/models';
import * as t from 'data/contentTypes';
import createGuid from 'utils/guid';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import { Resource, ResourceState } from 'data/content/resource';
import { insertNode } from '../../utils';
import { LegacyTypes } from 'data/types';

export class AddExistingAssessmentCommand extends AbstractCommand {

  onInsert(org, parent, services, resolve, assessment: Resource) {

    services.dismissModal();

    const id = createGuid();
    const resourceref = new t.ResourceRef().with({ idref: assessment.id });
    const item = new t.Item().with({ resourceref, id });

    resolve(insertNode(org, parent.guid, item, parent.children.size));
  }

  onCancel(services, reject) {
    services.dismissModal();
    reject();
  }

  description(): string {
    return 'Assessment';
  }

  execute(
    org: models.OrganizationModel,
    parent: t.Sequences | t.Sequence | t.Unit | t.Module | t.Section | t.Item | t.Include,
    context, services): Promise<models.OrganizationModel> {

    const predicate = (res: Resource): boolean =>
      res.type === LegacyTypes.assessment2
      && res.resourceState !== ResourceState.DELETED;

    return new Promise((resolve, reject) => {
      services.displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          courseId={context.courseId}
          onInsert={assessment => this.onInsert(org, parent, services, resolve, assessment)}
          onCancel={() => this.onCancel(services, reject)} />);
    });
  }
}
