import * as React from 'react';
import './InputLabel.scss';

export const InputLabel = (props) => {
  return (
    <div className="input-group">
      <span className="input-group-addon InputLabel">{props.label}</span>
      {props.children}
    </div>
  )
}; 