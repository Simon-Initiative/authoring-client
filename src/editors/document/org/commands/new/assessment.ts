import { AbstractCommand } from '../command';
import * as Immutable from 'immutable';
import * as models from '../../../../../data/models';
import { AppServices } from '../../../../common/AppServices';
import * as t from '../../../../../data/contentTypes';
import createGuid from '../../../../../utils/guid';

import { insertNode } from '../../utils';

export class CreateNewAssessmentCommand extends AbstractCommand {

  execute(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services: AppServices) : Promise<models.OrganizationModel> {
    
    return new Promise((resolve, reject) => {
      services.createAssessment('New Assessment', context.courseId)
        .then((document) => {
          console.log(document);
          const id = createGuid();
          if (document.model.modelType === models.ModelTypes.AssessmentModel) {
            const resourceref = new t.ResourceRef().with({ idref: document.model.resource.id });
            const item = new t.Item().with({ resourceref, id });
            resolve(insertNode(org, parent.guid, item, (parent as any).children.size));
          }
          
        });
    });
    
  }

  description() : string {
    return 'Assessment';
  }
}
