import * as React from 'react';

import { toggleInlineStyle, toggleBlockType, insertAtomicBlock, insertInlineEntity, AuthoringActionsHandler } from '../../../../../actions/authoring';
import { EntityTypes } from '../../../../../data/content/html/common';

import { AppServices } from '../../../../common/AppServices';
import { AppContext } from '../../../../common/AppContext';
import { titlesForEmbeddedResources } from '../../../../../data/domain';
import ResourceSelection from '../../../../../utils/selection/ResourceSelection';
import MediaSelection from '../../../../../utils/selection/MediaSelection';
import { createAttachment } from '../../../../../utils/selection/upload';
import { fileToBase64 } from '../../../../../utils/file';

export function insertImage(context: AppContext,
  services: AppServices, 
  dismissToolbar: () => void, 
  actionHandler: AuthoringActionsHandler) {

  return insertMedia(EntityTypes.image, 'image', 'image/*', context, services, dismissToolbar, actionHandler);
}

export function insertVideo(context: AppContext,
  services: AppServices, 
  dismissToolbar: () => void, 
  actionHandler: AuthoringActionsHandler) {

  return insertMedia(EntityTypes.video, 'video', 'video/*', context, services, dismissToolbar, actionHandler);
}

export function insertAudio(context: AppContext,
  services: AppServices, 
  dismissToolbar: () => void, 
  actionHandler: AuthoringActionsHandler) {

  return insertMedia(EntityTypes.audio, 'audio', 'audio/*', context, services, dismissToolbar, actionHandler);
}

function insertMedia(
  entityType: EntityTypes,
  mediaType : string, 
  accept : string,
  context: AppContext,
  services: AppServices, 
  dismissToolbar: () => void, 
  actionHandler: AuthoringActionsHandler) {

  services.displayModal(
      <MediaSelection
        accept={accept}
        type={mediaType}
        onInsert={(type, file) => {

          fileToBase64(file)
          .then(base64data => createAttachment(file.name, base64data, file.type, context.documentId))
          .then(src =>  {

            const data = {src};     
            actionHandler.handleAction(
              insertAtomicBlock(entityType, data));

            services.dismissModal();
            dismissToolbar();
          })
          .catch(err => {
            services.dismissModal();
            dismissToolbar();
          });
          
        }} 
        onCancel={() => {
          services.dismissModal();
          dismissToolbar();
        }}/>
  );
}