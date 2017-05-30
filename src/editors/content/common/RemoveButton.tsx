import * as React from 'react';

export type RemoveButtonProps = {
  onClick: () => void;
  editMode: boolean;
};

export const RemoveButton = (props: RemoveButtonProps) => {
  return (
    <button 
      disabled={!props.editMode} 
      onClick={props.onClick} 
      type="button" 
      className="btn btn-sm btn-outline-secondary">
        <i className="icon icon-remove"></i>
    </button>
  );
};
