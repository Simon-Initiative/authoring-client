import * as React from 'react';
import { classNames } from 'styles/jss';

export type DropdownItemProps = {
  className?: string
  label?: string,
  children?: any,
  onClick: (e?: any) => void,
};

export type DropdownProps = {
  className?: string
  children?: any,
  label: string,
};

export const DropdownItem = (props: DropdownItemProps) => {
  return (
    <a className={classNames([props.className, 'dropdown-item'])}
      onClick={props.onClick}>
      {props.children || props.label}
    </a>
  );
};

export const Dropdown = (props: DropdownProps) => {
  return (
    <div className={classNames([props.className, 'dropdown'])}>
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
