import * as React from 'react';

export type ButtonProps = {
  children?: any;
  onClick: () => void;
  type?: string;
}

export const Button = (props: ButtonProps) => {
  const type = props.type === undefined ? 'primary' : props.type;
  const classes = 'btn btn-sm btn-' + type;
  return (
    <button 
      onClick={props.onClick} 
      type="button" 
      className={classes}>
        {props.children}
    </button>
  )
}; 
