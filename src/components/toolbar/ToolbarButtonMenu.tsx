import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import guid from 'utils/guid';
import { styles } from './ToolbarButtonMenu.styles';
import { StyledComponentProps } from 'types/component';

export interface ToolbarWideMenuProps {
  className?: string;
  disabled: boolean;
  label: string;
  icon: any;
}

export type ToolbarNarrowMenuProps = ToolbarWideMenuProps;

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
  // Only pass through the onHide prop when the child is a TableCreation component
  const passthroughProps = c => c.props && c.props.onTableCreate ? { onHide: props.onHide } : {};
  return (
    <form className="px-3 py-0">
      <div className="form-group toolbarButtonMenuForm">
        {React.Children.map(
          props.children,
          c => React.cloneElement(c as any, passthroughProps(c)))}
      </div>
    </form>
  );
};

export const ToolbarButtonMenuDivider = () => {
  return (
    <div className="dropdown-divider"></div>
  );
};

export class ToolbarButtonMenuItem extends React.PureComponent<ToolbarButtonMenuItemProps> {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      disabled, onClick,
    } = this.props;

    const button = (
      <button
        type ="button"
        className="dropdown-item btn-sm"
        onClick={onClick}
        disabled={disabled}>
        {this.props.children}
      </button>
    );

    return button;
  }
}

class ToolbarNarrowMenu
  extends React.PureComponent<StyledComponentProps<ToolbarNarrowMenuProps, typeof styles>> {

  id: string;

  constructor(props) {
    super(props);
    this.id = guid();
  }

  render() {
    const {
      className, classes, disabled, icon, label,
    } = this.props;

    const style: any = { position: 'relative', width: '32px', maxWidth: '32px' };

    const button = (
      <button
        type="button"
        data-toggle="dropdown"
        data-boundary="window"
        style={style}
        id={this.id}
        data-offset="0,0"
        className={
          classNames([classes.toolbarNarrowButtonMenu, className,
            'btn', 'btn-sm', 'dropdown-toggle'])}
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
          classNames([classes.narrowMenu, 'dropdown', className])}>
        {button}
        <div className="dropdown-menu">
          {React.Children.map(this.props.children, c => React.cloneElement(c as any, { onHide }))}
        </div>
      </div>
    );

    return dropdown;

  }
}


const StyledToolbarNarrowMenu = withStyles<ToolbarNarrowMenuProps>(styles)(ToolbarNarrowMenu);
export { StyledToolbarNarrowMenu as ToolbarNarrowMenu };


class ToolbarWideMenu
  extends React.PureComponent<StyledComponentProps<ToolbarWideMenuProps, typeof styles>> {

  id: string;

  constructor(props) {
    super(props);
    this.id = guid();
  }

  render() {
    const {
      className, classes, disabled, icon, label,
    } = this.props;

    const style: any = { position: 'relative' };

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

const StyledToolbarWideMenu = withStyles<ToolbarWideMenuProps>(styles)(ToolbarWideMenu);
export { StyledToolbarWideMenu as ToolbarWideMenu };



class ToolbarQuadMenu
  extends React.PureComponent<StyledComponentProps<ToolbarQuadMenuProps, typeof styles>> {


  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, classes, ulComponent, llComponent, lrComponent, urComponent, disabled,
    } = this.props;

    const dropdown = (
      <div
        className={classNames([
          classes.quadDropdown,
          disabled && classes.quadDropdownDisabled, 'dropdown'])}>
        <button
          className={classNames([classes.quadButton, 'dropdown-toggle'])}
          disabled={disabled}
          data-toggle="dropdown"
          data-boundary="window"
          data-offset="-75,0"
        >
          <span className="sr-only">Toggle Dropdown</span>
        </button>
        <div
          style={{ marginTop: '-9px' }}
          className="dropdown-menu">
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
        classNames([classes.quadMenu, disabled && classes.quadMenuDisabled, className])}>
        {group}
      </div>
    );

  }
}

const StyledToolbarQuadMenu = withStyles<ToolbarQuadMenuProps>(styles)(ToolbarQuadMenu);
export { StyledToolbarQuadMenu as ToolbarQuadMenu };
