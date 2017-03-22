import * as React from 'react';

import EmbeddedEditorManager from '../../../../../editors/manager/EmbeddedEditorManager';

export const EmbeddedDocument = (props) => {
  return (
    <EmbeddedEditorManager 
      onEditModeChange={() => props.blockProps.onEditModeChange(true)}
      editMode={false}
      services={props.blockProps.services} 
      userId={props.blockProps.userId} 
      documentId={props.id}/>
    );
};