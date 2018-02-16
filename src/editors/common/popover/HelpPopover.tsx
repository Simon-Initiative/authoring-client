import * as React from 'react';
import { Tooltip } from 'utils/tooltip';

// How do we make either title or content required?
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
  theme: 'dark',
  animation: 'shift',
  interactive: true,
  arrow: true,
  position: Position.Top,
  // Figure out how to get this to work. It targets the wrong div
  style: {
    padding: '15px',
    maxWidth: '250px',
    textAlign: 'left',
  },
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
            html={this.props.children}>
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

// buttonRef: any;
// this.onClick = this.onClick.bind(this);
// Fixes issue with href attribute being required on <a> tag for popover to work
// onClick(e) {
//   e.preventDefault();
// }

// componentDidMount() {
//   (window as any).$(() => (window as any).$(this.buttonRef).popover());
// }

// <a
//   ref={a => this.buttonRef = a}
//   onClick={this.onClick}
//   title={this.props.title || ''}
//   data-content={this.props.content}
//   data-placement={this.props.placement || Direction.Top}
//   href="#"
//   tab-index="0" 
//   className="btn" 
//   role="button" 
//   data-toggle="popover" 
//   data-trigger="focus" 
// >
//   <i style={iconStyle} className={iconClasses}></i>
// </a>
