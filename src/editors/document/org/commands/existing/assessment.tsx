import { AbstractCommand } from '../command';
import * as models from 'data/models';
import * as t from 'data/contentTypes';
import createGuid from 'utils/guid';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import { Resource, ResourceState } from 'data/content/resource';
import { LegacyTypes } from 'data/types';
import * as o from 'data/models/utils/org';
import { Maybe } from 'tsmonad';

export class AddExistingAssessmentCommand extends AbstractCommand {

  onInsert(org, parent, dismissModal, resolve, assessment: Resource) {

    dismissModal();

    const id = createGuid();
    const resourceref = new t.ResourceRef().with({ idref: assessment.id });
    const item = new t.Item().with({ resourceref, id });

    const cr = o.makeAddNode(parent.id, item, Maybe.nothing());
    resolve(cr);
  }

  onCancel(dismissModal, reject) {
    dismissModal();
    reject();
  }

  description(): string {
    return 'Assessment';
  }

  execute(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch): Promise<o.OrgChangeRequest> {

    const predicate = (res: Resource): boolean =>
      res.type === LegacyTypes.assessment2
      && res.resourceState !== ResourceState.DELETED;

    return new Promise((resolve, reject) => {
      displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          onInsert={assessment => this.onInsert(org, parent, dismissModal, resolve, assessment)}
          onCancel={() => this.onCancel(dismissModal, reject)} />);
    });
  }
}
