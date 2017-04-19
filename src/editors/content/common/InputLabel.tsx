import * as React from 'react';
import './InputLabel.scss';

export const InputLabel = (props) => {
  const classes = 'input-group-addon InputLabel-' + props.style;
  return (
    <div className="input-group">
      <span className={classes}>{props.label}</span>
      {props.children}
    </div>
  )
}; 