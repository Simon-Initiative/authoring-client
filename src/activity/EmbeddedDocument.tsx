import * as React from 'react';

import EditorManager from '../editors/manager/EditorManager';

export const EmbeddedDocument = (props) => {
  return (
    <div onClick={() => props.blockProps.onEditMode(true)}>
      <EditorManager 
          editMode={false}
          services={props.blockProps.services} 
          userId={props.blockProps.userId} 
          documentId={props.id}/>
    </div>);
};