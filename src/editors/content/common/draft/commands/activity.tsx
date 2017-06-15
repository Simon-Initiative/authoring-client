import * as React from 'react';

import { EntityTypes } from '../../../../../data/content/html/common';
import { Activity } from '../../../../../data/content/html/activity';
import { AppServices } from '../../../../common/AppServices';
import { AppContext } from '../../../../common/AppContext';
import AssessmentSelection from '../../../../../utils/selection/AssessmentSelection';
import { InsertBlockEntityCommand } from '../../draft/commands/insert';
import { AbstractCommand } from '../../command';
import { EditorState } from 'draft-js';

export class InsertActivityCommand extends AbstractCommand<EditorState> {

  onInsert(editorState: EditorState, context, services, resolve, reject, assessment) {
   
    services.dismissModal();
    
    const resources = context.courseModel.resources.toArray();

    const found = resources.find(r => r.guid === assessment.id);
    
    const data = { activity: new Activity({ idref: found.id }) };

    const delegate = new InsertBlockEntityCommand(EntityTypes.activity, 'IMMUTABLE', data);
    delegate.execute(editorState, context, services)
      .then(newState => resolve(newState))
      .catch(err => reject(err));
  }

  onCancel(services) {
    services.dismissModal();
  }

  execute(
    editorState: EditorState, context: AppContext, 
    services: AppServices) : Promise<EditorState> {
    
    return new Promise((resolve, reject) => {
      services.displayModal(
        <AssessmentSelection
          courseId={context.courseId}
          onInsert={this.onInsert.bind(this, editorState, context, services, resolve, reject)} 
          onCancel={this.onCancel.bind(this, services)}/>);
    });
  }
}
