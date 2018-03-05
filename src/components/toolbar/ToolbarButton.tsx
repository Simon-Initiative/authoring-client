import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';

import styles from './ToolbarButton.style';

export enum ToolbarButtonSize {
  Large = 'large',
  Small = 'small',
  Wide = 'wide',
}

export interface ToolbarButtonProps {
  className?: string;
  size?: ToolbarButtonSize;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  tooltip?: string;
}

@injectSheet(styles)
export class ToolbarButton extends React.Component<ToolbarButtonProps & JSSProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, classes, disabled, selected, size = ToolbarButtonSize.Small, onClick,
    } = this.props;

    return (
      <button
        type="button"
        className={classNames([classes.toolbarButton, size, className, selected ? 'selected' : ''])}
        onClick={onClick}
        disabled={disabled}>
        {this.props.children}
      </button>
    );
  }
}
