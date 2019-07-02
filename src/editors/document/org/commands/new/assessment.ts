import { AbstractCommand } from '../command';
import * as models from '../../../../../data/models';
import { createResource } from './create';
import * as t from '../../../../../data/contentTypes';
import createGuid from '../../../../../utils/guid';
import * as o from 'data/models/utils/org';
import { Maybe } from 'tsmonad';
import { LegacyTypes } from 'data/types';


export class CreateNewAssessmentCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel,
    parent: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch): Promise<o.OrgChangeRequest> {

    const resource = new models.AssessmentModel({
      type: LegacyTypes.assessment2,
      title: t.Title.fromText('New Assessment'),
    });

    return new Promise((resolve, reject) => {
      createResource(courseModel.idvers, resource, dispatch)
        .then((document) => {

          const id = createGuid();
          if (document.model.modelType === models.ModelTypes.AssessmentModel) {
            const resourceref = new t.ResourceRef().with({ idref: document.model.resource.id });
            const item = new t.Item().with({ resourceref, id });

            const cr = o.makeAddNode(parent.id, item, Maybe.nothing());
            resolve(cr);
          }

        });
    });

  }

  description(): string {
    return 'Assessment';
  }
}
