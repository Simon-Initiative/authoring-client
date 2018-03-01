import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';

import { styles } from './ToolbarButton.style';

export enum ToolbarButtonSize {
  Large = 'large',
  Small = 'small',
  Wide = 'wide',
}

export interface ToolbarButtonProps {
  size?: ToolbarButtonSize;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

@injectSheet(styles)
export class ToolbarButton extends React.Component<ToolbarButtonProps & JSSProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, disabled, size = ToolbarButtonSize.Small, onClick } = this.props;

    return (
      <button
        type="button"
        className={classNames([classes.toolbarButton, size])}
        onClick={onClick}
        disabled={disabled}>
        {this.props.children}
      </button>
    );
  }
}
