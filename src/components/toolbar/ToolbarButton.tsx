import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import { Tooltip } from 'utils/tooltip';

import { styles } from './ToolbarButton.styles';
import { StyledComponentProps } from 'types/component';

export enum ToolbarButtonSize {
  Large = 'large',
  Small = 'small',
  Wide = 'wide',
  Full = 'full',
  Fit = 'fit',
  ExtraWide = 'extraWide',
}

export interface ToolbarButtonProps {
  className?: string;
  size?: ToolbarButtonSize;
  style?: Object;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  tooltip?: string;
}

class ToolbarButton
  extends React.PureComponent<StyledComponentProps<ToolbarButtonProps, typeof styles>> {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, classes, disabled, selected, size = ToolbarButtonSize.Small, onClick,
      tooltip, style,
    } = this.props;

    const button = (
      <button
        type="button"
        className={
          classNames(['ToolbarButton', classes.toolbarButton, size,
            className, selected ? 'selected' : ''])}
        style={style}
        onClick={onClick}
        disabled={disabled}>
        {this.props.children}
      </button>
    );

    return tooltip ?
      (
        <Tooltip
          duration={0}
          title={tooltip}
          delay={0}
          distance={5}
          style={{ display: 'inline-block' }}
          size="small"
          arrowSize="small"
        >
          {button}
        </Tooltip>
      )
      : button;
  }
}

const StyledToolbarButton = withStyles<ToolbarButtonProps>(styles)(ToolbarButton);
export { StyledToolbarButton as ToolbarButton };
