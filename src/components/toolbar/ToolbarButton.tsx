import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import { Tooltip } from 'utils/tooltip';

import styles from './ToolbarButton.style';

export enum ToolbarButtonSize {
  Large = 'large',
  Small = 'small',
  Wide = 'wide',
}

export interface ToolbarButtonProps extends JSSProps {
  className?: string;
  size?: ToolbarButtonSize;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  tooltip?: string;
}

@injectSheet(styles)
export class ToolbarButton extends React.Component<ToolbarButtonProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, classes, disabled, selected, size = ToolbarButtonSize.Small, onClick,
      tooltip,
    } = this.props;

    const button = (
      <button
        type="button"
        className={
          classNames([classes.toolbarButton, size, className, selected ? 'selected' : ''])}
        onClick={onClick}
        disabled={disabled}>
        {this.props.children}
      </button>
    );

    return tooltip ?
      (
        <Tooltip title={tooltip} delay={1000}
            size="small" arrowSize="small">
          {button}
        </Tooltip>
      )
      : button;
  }
}
