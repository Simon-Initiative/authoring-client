import * as React from 'react';

// Props from Bootstrap popover options
export type HelpPopoverProps = {
  title?: string,
  content: string,
  placement?: Direction,
};

export enum Direction {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Down = 'down',
}

export class HelpPopover extends React.PureComponent<HelpPopoverProps, {}> {
  buttonRef: any;

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  // Fixes issue with href attribute being required on <a> tag for popover to work
  onClick(e) {
    e.preventDefault();
  }

  componentDidMount() {
    (window as any).$(() => (window as any).$(this.buttonRef).popover());
  }

  render() {
    const buttonStyle = {

    };

    const iconClasses = 'fa fa-question-circle';

    const iconStyle = {

    };

    return (
      <a
        ref={a => this.buttonRef = a}
        onClick={this.onClick}
        title={this.props.title || ''}
        data-content={this.props.content}
        data-placement={this.props.placement || Direction.Top}
        href="#"
        tab-index="0" 
        className="btn" 
        role="button" 
        data-toggle="popover" 
        data-trigger="focus" 
      >
        <i style={iconStyle} className={iconClasses}></i>
      </a>
    );
  }
}
