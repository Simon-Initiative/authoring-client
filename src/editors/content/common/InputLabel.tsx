import * as React from 'react';
import './InputLabel.scss';
import '../concepts/Concept.scss';

export type InputLabelProps = {
  onRemove?: () => void; 
  children?: any;
  label?: string;
  style?: string;
}

export const InputLabel = (props: InputLabelProps) => {
  const classes = 'input-group-addon InputLabel-' + (props.style === undefined ? 'default' : props.style);
  const remove = props.onRemove !== undefined ? <span className="closebtn input-group-addon" onClick={props.onRemove}>&times;</span> : null;
  const label = props.label !== undefined ? <span className={classes}>{props.label}</span> : null;
  return (
    <div className="input-group">
      {label}
      {props.children}
      {remove}
    </div>
  )
}; 