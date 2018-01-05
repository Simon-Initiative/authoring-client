import * as React from 'react';

export type ButtonProps = {
  children?: any;
  className? : string;
  onClick: () => void;
  type?: string;
  editMode: boolean;
};

export const Button = (props: ButtonProps) => {
  const type = props.type === undefined ? 'primary' : props.type;
  const classes = 'btn btn-sm btn-' + type + (props.className ? ` ${props.className}` : '');
  return (
    <button
      disabled={!props.editMode}
      onClick={props.onClick}
      type="button"
      className={classes}>{props.children}</button>
  );
};
