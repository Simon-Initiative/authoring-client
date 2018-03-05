import * as React from 'react';
import { Tooltip } from 'utils/tooltip';
import './HelpPopover.scss';

export type HelpPopoverProps = {
  title?: string,
  position?: Position,
};

export enum Position {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Down = 'down',
}

const DEFAULT_TOOLTIP_PROPS = {
  theme: 'light',
  animation: 'shift',
  interactive: true,
  arrow: true,
  position: Position.Top,
  className: 'help-popover-trigger',
};

const mergeWithDefaultProps = props =>
  Object.assign({}, DEFAULT_TOOLTIP_PROPS, props);

export class HelpPopover extends React.PureComponent<HelpPopoverProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const props = mergeWithDefaultProps(this.props);

    const icon = <i className={'fa fa-question-circle'}></i>;

    return (
      this.props.children
        ? <Tooltip
            {...props}
            html={
              <div className="help-popover-container">
                {this.props.children}
              </div>}>
            {icon}
          </Tooltip>
        : <Tooltip 
            {...props}
            title={this.props.title || ''}>
            {icon}
          </Tooltip>
    );
  }
}

/* Example of HelpPopover usage. Leaving in code until we use this in production.
<span className="float-right">
  {<HelpPopover>
    <div>
      <p>Looks like you could use some help.</p>
      <br />
      <p>You can click <a href="#" target="_blank">here</a> to 
      get some more information.</p>
    </div>
  </HelpPopover>}
</span> 
*/
