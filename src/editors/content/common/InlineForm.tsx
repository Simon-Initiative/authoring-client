import * as React from 'react';
import './InputForm.scss';

export type Left = 'left';
export type Right = 'right';
export type Position = Left | Right;

export type InlineFormProps = {
  children?: any,
  position: Position
}

const Spacer = (props) => <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>; // There is probably a better way...

export const InlineForm = (props: InlineFormProps) => {
  const classes = 'form-inline InputForm-' + props.position;

  const interleaved = (props.children instanceof Array) ?
    props.children
      .map((c, i) => [c, <Spacer key={i}/>])
      .reduce((p, c) => p.concat(c), []) : props.children;

  return (
    <form className={classes}>
      {interleaved}
    </form>
  )
}; 