import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import { Tooltip } from 'utils/tooltip';
import guid from 'utils/guid';

import { styles } from './ToolbarButtonMenu.styles';

export interface ToolbarButtonMenuProps {
  className?: string;
  tooltip: string;
  disabled: boolean;
  icon: any;
}


export interface ToolbarButtonMenuItemProps {
  onClick: () => void;
  disabled: boolean;
}

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
export class ToolbarButtonMenu extends React.PureComponent<ToolbarButtonMenuProps & JSSProps> {

  id: string;

  constructor(props) {
    super(props);

    this.id = guid();
  }

  toggleDropdown() {
    const jQ = (window as any).jQuery;
    jQ('#' + this.id).dropdown('toggle');
  }

  render() {
    const {
      className, classes, tooltip, disabled, icon,
    } = this.props;

    const style : any = { position: 'relative' };

    const button = (
      <button
        type="button"
        data-toggle="dropdown"
        data-boundary="window"
        style={style}
        data-offset="0,0"
        id={this.id}
        className={
          classNames([classes.toolbarButtonMenu, className, 'btn'])}
        disabled={disabled}>
        {icon}
      </button>
    );

    const dropdown = (
      <div className="dropdown" style={{ display: 'inline-block' }}>
        {button}
        <div className="dropdown-menu">
          <form className="px-3 py-0">
            <div className="form-group">
              <small className="text-muted">{this.props.tooltip}</small>
            </div>
          </form>
          <div className="dropdown-divider"></div>
          {this.props.children}
        </div>

      </div>
    );

    return dropdown;
  }
}
