import * as React from 'react';
import * as persistence from '../../../data/persistence';
import { EntityTypes } from '../../../data/content/html/common';

import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import ResourceSelection from '../../../utils/selection/ResourceSelection';
import MediaSelection from '../../../utils/selection/MediaSelection';
import { createAttachment } from '../../../utils/selection/upload';
import { fileToBase64 } from '../../../utils/file';

function onInsert(context, services, resolve, reject, type, file) {
   
  services.dismissModal();

  persistence.createWebContent(context.courseId, file)
  .then(src => resolve(src))
  .catch(err => reject(err));
}

export function uploadFile(
  mediaType: string, accept: string, 
  context: AppContext, services: AppServices) : Promise<string> {
  
  return new Promise((resolve, reject) => {
    services.displayModal(
      <MediaSelection
        accept={accept}
        type={mediaType}
        onInsert={onInsert.bind(undefined, context, services, resolve, reject)} 
        onCancel={() => services.dismissModal()}/>);
  });
}

