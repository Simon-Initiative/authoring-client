import * as React from 'react';
import { classNames } from 'styles/jss';

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
        <i className={props.customIcon || `fa fa-close`}></i>
      </button>
    </span>
  );
};
