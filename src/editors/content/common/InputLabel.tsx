import * as React from 'react';
import './InputLabel.scss';
import '../concepts/Concept.scss';

export type InputLabelProps = {
  onRemove?: () => void; 
  children?: any;
  label: string;
  style: string;
}

export const InputLabel = (props: InputLabelProps) => {
  const classes = 'input-group-addon InputLabel-' + props.style;
  const remove = props.onRemove !== undefined ? <span className="closebtn input-group-addon" onClick={props.onRemove}>&times;</span> : null;
  return (
    <div className="input-group">
      <span className={classes}>{props.label}</span>
      {props.children}
      {remove}
    </div>
  )
}; 