import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import guid from 'utils/guid';

import { styles } from './ToolbarButtonMenu.styles';

export interface ToolbarWideMenuProps {
  className?: string;
  disabled: boolean;
  label: string;
  icon: any;
}


export interface ToolbarQuadMenuProps {
  className?: string;
  disabled: boolean;
  ulComponent: JSX.Element;
  llComponent: JSX.Element;
  urComponent: JSX.Element;
  lrComponent: JSX.Element;
}


export interface ToolbarButtonMenuProps {
  className?: string;
  disabled: boolean;
  label: string;
  icon: any;
}


export interface ToolbarButtonMenuItemProps {
  onClick: () => void;
  disabled: boolean;
}

export const ToolbarButtonMenuForm = (props) => {
  return (
    <form className="px-3 py-0">
      <div className="form-group toolbarButtonMenuForm">
        {React.Children.map(
          props.children,
          c => React.cloneElement(c as any, { onHide: props.onHide }))}
      </div>
    </form>
  );
};

export const ToolbarButtonMenuDivider = () => {
  return (
    <div className="dropdown-divider"></div>
  );
};

export class ToolbarButtonMenuItem
  extends React.PureComponent<ToolbarButtonMenuItemProps> {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      disabled, onClick,
    } = this.props;

    const button = (
      <button
        type="button btn-sm"
        className="dropdown-item"
        onClick={onClick}
        disabled={disabled}>
        {this.props.children}
      </button>
    );

    return button;
  }
}

@injectSheet(styles)
export class ToolbarWideMenu
  extends React.PureComponent<ToolbarWideMenuProps & JSSProps> {

  id: string;

  constructor(props) {
    super(props);
    this.id = guid();
  }

  render() {
    const {
      className, classes, disabled, icon, label,
    } = this.props;

    const style : any = { position: 'relative' };

    const button = (
      <button
        type="button"
        data-toggle="dropdown"
        data-boundary="window"
        style={style}
        id={this.id}
        data-offset="0,0"
        className={
          classNames([classes.toolbarButtonMenu, className, 'btn', 'btn-sm', 'dropdown-toggle'])}
        disabled={disabled}>
        {icon} {label}
      </button>
    );

    const onHide = () => {
      const jq = (window as any).jQuery;
      jq('#' + this.id).dropdown('toggle');
    };

    const dropdown = (
      <div
        className={
        classNames([classes.wideMenu, 'dropdown', className])}>
        {button}
        <div className="dropdown-menu">
          {React.Children.map(this.props.children, c => React.cloneElement(c as any, { onHide }))}
        </div>
      </div>
    );

    return dropdown;

  }
}


@injectSheet(styles)
export class ToolbarQuadMenu
  extends React.PureComponent<ToolbarQuadMenuProps & JSSProps> {


  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, classes, ulComponent, llComponent, lrComponent, urComponent, disabled,
    } = this.props;

    const dropdown = (
      <div
        className={classNames([classes.quadDropdown, 'dropdown'])}>
        <button
          className={classNames([classes.quadButton, 'dropdown-toggle'])}
          disabled={disabled}
          data-toggle="dropdown"
          data-boundary="window"
          data-offset="-75,16"
          >
          <span className="sr-only">Toggle Dropdown</span>
        </button>
        <div className="dropdown-menu">
          {this.props.children}
        </div>
      </div>
    );

    const group = (
      <div className={classNames([classes.quadMatrix])}>
        <div className={classNames([classes.matrixCol1])}>
          {ulComponent}
          {llComponent}
        </div>
        <div className={classNames([classes.matrixCol2])}>
          {urComponent}
          {lrComponent}
        </div>
        {dropdown}
      </div>
    );

    return (
      <div className={
        classNames([classes.quadMenu, className])}>
        {group}
      </div>
    );

  }
}
