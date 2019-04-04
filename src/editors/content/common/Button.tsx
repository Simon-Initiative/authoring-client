import * as React from 'react';

export type ButtonProps = {
  children?: any;
  className?: string;
  onClick: () => void;
  type?: string;
  size?: string;
  editMode: boolean;
};

export const Button = (props: ButtonProps) => {
  const type = props.type === undefined ? 'primary' : props.type;
  const size = props.size === undefined ? 'sm' : props.size;
  const classes = `btn btn-${size} btn-${type} ${props.className}`;
  return (
    <button
      disabled={!props.editMode}
      onClick={props.onClick}
      type="button"
      className={classes}>{props.children}</button>
  );
};
