import { AbstractCommand } from '../command';
import * as Immutable from 'immutable';
import * as models from '../../../../../data/models';
import * as t from '../../../../../data/contentTypes';
import AssessmentSelection from '../../../../../utils/selection/AssessmentSelection';
import createGuid from '../../../../../utils/guid';

import { insertNode } from '../../utils';

export class AddExistingAssessmentCommand extends AbstractCommand {

  onInsert(org, parent, context, services, resolve, reject, assessment) {
   
    services.dismissModal();
    
    const resources = context.courseModel.resources.toArray();
    const found = resources.find(r => r.guid === assessment.id);
    
    const id = createGuid();
    const resourceref = new t.ResourceRef().with({ idref: found.id });
    const item = new t.Item().with({ resourceref, id });
    
    resolve(insertNode(org, parent.guid, item, parent.children.size));
  }

  onCancel(services) {
    services.dismissModal();
  }

  description() : string {
    return 'Add existing assessment';
  }

  execute(
    org: models.OrganizationModel, 
    parent: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context, services) : Promise<models.OrganizationModel> {
    
    return new Promise((resolve, reject) => {
      services.displayModal(
        <AssessmentSelection
          courseId={context.courseId}
          onInsert={this.onInsert.bind(this, org, parent, context, services, resolve, reject)} 
          onCancel={this.onCancel.bind(this, services)}/>);
    });
  }
}
