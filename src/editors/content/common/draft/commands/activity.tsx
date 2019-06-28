import * as React from 'react';

import { EntityTypes } from 'data/content/learning/common';
import { Activity } from 'data/content/workbook/activity';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { AssessmentSelection, AssessmentsToDisplay } from 'utils/selection/AssessmentSelection';
import { InsertBlockEntityCommand } from '../../draft/commands/insert';
import { AbstractCommand } from '../../command';
import { EditorState } from 'draft-js';

export class InsertActivityCommand extends AbstractCommand<EditorState> {

  onInsert(editorState: EditorState, context, services, resolve, reject, assessment) {

    services.dismissModal();

    const data = { activity: new Activity({ idref: assessment.resource.id }) };

    const delegate = new InsertBlockEntityCommand(EntityTypes.image, 'IMMUTABLE', data);
    delegate.execute(editorState, context, services)
      .then(newState => resolve(newState))
      .catch(err => reject(err));
  }

  onCancel(services) {
    services.dismissModal();
  }

  execute(
    editorState: EditorState, context: AppContext,
    services: AppServices): Promise<EditorState> {

    return new Promise((resolve, reject) => {
      services.displayModal(
        <AssessmentSelection
          toDisplay={AssessmentsToDisplay.Summative}
          courseIdentifier={context.courseModel.identifier}
          onInsert={this.onInsert.bind(this, editorState, context, services, resolve, reject)}
          onCancel={this.onCancel.bind(this, services)} />);
    });
  }
}
