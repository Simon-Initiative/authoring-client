import * as React from 'react';


// tslint:disable-next-line
export const Remove = (props) => {
  return (
    <span style={ { float: 'right', paddingTop: '4px' } }>
      <button 
        disabled={!props.editMode} 
        onClick={props.onRemove} 
        type="button" 
        className="btn btn-sm btn-outline-secondary">
        <i className="icon icon-remove"></i>
      </button>
    </span>
  );
};
