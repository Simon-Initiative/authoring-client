import * as React from 'react';
import * as persistence from '../../../data/persistence';

import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import MediaSelection from '../../../utils/selection/MediaSelection';

function onInsert(context, services, resolve, reject, type, file) {

  services.dismissModal();

  persistence.createWebContent(context.courseModel.idvers, file)
    .then(src => resolve(src))
    .catch(err => reject(err));
}

export function uploadFile(
  mediaType: string, accept: string,
  context: AppContext, services: AppServices): Promise<string> {

  return new Promise((resolve, reject) => {
    services.displayModal(
      <MediaSelection
        accept={accept}
        type={mediaType}
        onInsert={onInsert.bind(undefined, context, services, resolve, reject)}
        onCancel={() => services.dismissModal()} />);
  });
}

