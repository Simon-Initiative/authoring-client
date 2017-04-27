import * as React from 'react';

import { EntityTypes } from '../../../../../data/content/html/common';
import { WbInline } from '../../../../../data/content/html/wbinline';
import { AppServices } from '../../../../common/AppServices';
import { AppContext } from '../../../../common/AppContext';
import AssessmentSelection from '../../../../../utils/selection/AssessmentSelection';
import { InsertBlockEntityCommand } from '../../draft/commands/insert'
import { AbstractCommand } from '../../command';
import { EditorState } from 'draft-js';

export class InsertAssessmentCommand extends AbstractCommand<EditorState> {

  onInsert(editorState: EditorState, context, services, resolve, reject, assessment) {
   
    services.dismissModal();
    
    const data = { wbinline: new WbInline({idRef: assessment.id})};

    const delegate = new InsertBlockEntityCommand(EntityTypes.wb_inline, 'IMMUTABLE', data);
    delegate.execute(editorState, context, services)
      .then(newState => resolve(newState))
      .catch(err => reject(err));
  }

  onCancel(services) {
    services.dismissModal();
  }

  execute(editorState: EditorState, context: AppContext, services: AppServices) : Promise<EditorState> {
    
    return new Promise((resolve, reject) => {
      services.displayModal(
        <AssessmentSelection
          courseId={context.courseId}
          onInsert={this.onInsert.bind(this, editorState, context, services, resolve, reject)} 
          onCancel={this.onCancel.bind(this, services)}/>);
    });
  }
}