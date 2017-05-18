import * as React from 'react';

import { EntityTypes } from '../../../data/content/html/common';

import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import ResourceSelection from '../../../utils/selection/ResourceSelection';
import MediaSelection from '../../../utils/selection/MediaSelection';
import { createAttachment } from '../../../utils/selection/upload';
import { fileToBase64 } from '../../../utils/file';

function onInsert(context, services, resolve, reject, type, file) {
   
  services.dismissModal();

  fileToBase64(file)
  .then(base64data => createAttachment(file.name, base64data, file.type, context.documentId))
  .then(src => resolve(file.name))
  .catch(err => reject(err));
}

export function uploadFile(
  mediaType: string, accept: string, 
  context: AppContext, services: AppServices) : Promise<string> {
  
  return new Promise((resolve, reject) => {
    services.displayModal(
      <MediaSelection
        accept={this.accept}
        type={this.mediaType}
        onInsert={onInsert.bind(undefined, context, services, resolve, reject)} 
        onCancel={() => services.dismissModal()}/>);
  });
}

