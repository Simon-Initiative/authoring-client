import * as React from 'react';

export type DropdownItemProps = {
  onClick: (e?: any) => void,
  label?: string,
  children?: any,
};

export type DropdownProps = {
  children?: any,
  label: string,
};

export const DropdownItem = (props: DropdownItemProps) => {
  return <a onClick={props.onClick} className="dropdown-item">{props.children || props.label}</a>;
};

export const Dropdown = (props: DropdownProps) => {
  return (
    <div className="dropdown" style={{ display: 'inline' }}>
      <button
        className="btn btn-secondary btn-link dropdown-toggle"
        type="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        {props.label}
      </button>
      <div className="dropdown-menu">
        {props.children}
      </div>
    </div>
  );
};


