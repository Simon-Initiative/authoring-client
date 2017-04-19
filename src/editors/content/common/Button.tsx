import * as React from 'react';

export type ButtonProps = {
  children?: any;
  onClick: () => void;
}

export const Button = (props: ButtonProps) => {
  return (
    <button 
      onClick={props.onClick} 
      type="button" 
      className="btn btn-sm btn-primary">
        {props.children}
    </button>
  )
}; 
