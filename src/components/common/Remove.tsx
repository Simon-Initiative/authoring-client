import * as React from 'react';

import './Remove.scss';

// tslint:disable-next-line
export const Remove = (props) => {
  return (
    <span className={`remove-btn ${props.className || ''}`}>
      <button
        disabled={!props.editMode}
        tabIndex={-1}
        onClick={e => props.editMode && props.onRemove(e)}
        type="button"
        className="btn btn-sm">
        {props.children
          ? props.children
          : props.loading
            ? <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" />
            : <i className={props.customIcon || 'fas fa-times'} />
        }
      </button>
    </span>
  );
};
