import * as React from 'react';

import './Remove.scss';

// tslint:disable-next-line
export const Remove = (props) => {
  return (
    <span className={`remove-btn ${props.className || ''}`}>
      <button
        disabled={!props.editMode}
        onClick={e => props.editMode && props.onRemove(e)}
        type="button"
        className="btn btn-sm">
        {console.clear() || console.log('props.loading', props.loading)}
        {props.loading
          ? <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />
          : <i className={props.customIcon || `fa fa-close`}></i>}
      </button>
    </span>
  );
};
