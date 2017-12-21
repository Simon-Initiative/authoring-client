import * as React from 'react';

import { EntityTypes } from '../../../../../data/content/html/common';

import { AppServices } from '../../../../common/AppServices';
import { AppContext } from '../../../../common/AppContext';
import ResourceSelection from '../../../../../utils/selection/ResourceSelection';
import MediaSelection from '../../../../../utils/selection/MediaSelection';
import { createAttachment } from '../../../../../utils/selection/upload';
import { fileToBase64 } from '../../../../../utils/file';
import { InsertBlockEntityCommand } from '../../draft/commands/insert';
import { appendText } from '../../draft/commands/common';
import { AbstractCommand } from '../../command';
import { EditorState, ContentState, SelectionState, Modifier, AtomicBlockUtils } from 'draft-js';

export class InsertMediaCommand extends AbstractCommand<EditorState> {

  type: EntityTypes;
  mediaType: string;
  accept: string;

  constructor(type: EntityTypes, mediaType: string, accept: string) {
    super();

    this.type = type;
    this.mediaType = mediaType;
    this.accept = accept;
  }

  onInsert(editorState: EditorState, context, services, resolve, reject, type, file) {
   
    fileToBase64(file)
      .then(base64data => createAttachment(file.name, base64data, file.type, context.documentId))
      .then(src =>  {

        services.dismissModal();

        const data = { src };    

        const delegate = new InsertBlockEntityCommand(this.type, 'IMMUTABLE', data);
        delegate.execute(editorState, context, services)
          .then(newState => resolve(newState))
          .catch(err => reject(err));

      })
      .catch(err => {
        services.dismissModal();

        reject(err);
      });
            
   
  }

  onCancel(services) {
    services.dismissModal();
  }

  execute(editorState: EditorState, context: AppContext, services: AppServices) : Promise<EditorState> {
    
    return new Promise((resolve, reject) => {
      services.displayModal(
        <MediaSelection
          accept={this.accept}
          type={this.mediaType}
          onInsert={this.onInsert.bind(this, editorState, context, services, resolve, reject)} 
          onCancel={this.onCancel.bind(this, services)}/>);
    });
  }
}
