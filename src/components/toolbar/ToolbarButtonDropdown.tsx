import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import { Tooltip } from 'utils/tooltip';
import { ToolbarButtonSize } from './ToolbarButton';
import { styles } from './ToolbarButton.styles';
import { Autohider } from './Autohider';

export interface ToolbarButtonDropdownProps {
  className?: string;
  label: any;
  disabled?: boolean;
  selected?: boolean;
  tooltip?: string;
}

export interface ToolbarButtonDropdownState {
  shown: boolean;
}

@injectSheet(styles)
export class ToolbarButtonDropdown
  extends React.Component<ToolbarButtonDropdownProps & JSSProps, ToolbarButtonDropdownState> {
  constructor(props) {
    super(props);

    this.state = { shown: false };
  }

  onClick() {
    this.setState({ shown: !this.state.shown });
  }

  render() {
    const {
      className, classes, disabled, selected,
      tooltip,
    } = this.props;

    const button = (
      <button
        type="button"
        className={
          classNames([classes.toolbarButton,
            ToolbarButtonSize.Small, className, selected ? 'selected' : ''])}
        onClick={this.onClick.bind(this)}
        disabled={disabled}>
        {this.props.label}
      </button>
    );

    const onHide = () => this.setState({ shown: false });

    const component = this.state.shown
      ?
        <Autohider onLoseFocus={() => this.setState({ shown: false })}>
          <div style={ { position: 'absolute', zIndex: 10000 } }>
           {React.Children.map(this.props.children, c => React.cloneElement(c as any, { onHide }))}
          </div>
        </Autohider>
      : null;

    return tooltip ?
      (
        <Tooltip title={tooltip} delay={1000} distance={5} style={{ display: 'inline-block' }}
            size="small" arrowSize="small">
          {button}
          {component}
        </Tooltip>
      )
      : <React.Fragment>{button}{component}</React.Fragment>;
  }
}
