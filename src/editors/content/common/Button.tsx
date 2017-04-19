import * as React from 'react';

export const Button = (props) => {
  return (
    <button 
      onClick={props.onClick} 
      type="button" 
      className="btn btn-sm btn-primary">
        {props.children}
    </button>
  )
}; 
