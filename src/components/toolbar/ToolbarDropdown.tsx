import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';

import styles from './ToolbarDropdown.style';

export enum ToolbarDropdownSize {
  Large = 'large',
  Small = 'small',
  Wide = 'wide',
}

export interface ToolbarDropdownProps {
  className?: string;
  size?: ToolbarDropdownSize;
  selected?: boolean;
  label: JSX.Element;
  hideArrow?: boolean;
}

@injectSheet(styles)
export class ToolbarDropdown extends React.PureComponent<ToolbarDropdownProps & JSSProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, classes, selected, size = ToolbarDropdownSize.Small, label, hideArrow,
    } = this.props;

    return (
      <div className={classNames([classes.toolbarDropdown, 'dropdown'])}>
        <button
            className={
              classNames([classes.toolbarDropdownButton, size,
                className, selected ? 'selected' : ''])}
            data-toggle={'dropdown'}
            type="button">
          {label}
          {!hideArrow && <i className="droparrow fa fa-caret-down"/>}
        </button>
        <div className="dropdown-menu dropdown-menu-right">
          {this.props.children}
        </div>
      </div>
    );
  }
}
