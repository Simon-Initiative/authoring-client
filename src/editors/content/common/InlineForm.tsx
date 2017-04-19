import * as React from 'react';
import './InputForm.scss';

export const InlineForm = (props) => {
  return (
    <form className="form-inline InputForm">
      {props.children}
    </form>
  )
}; 