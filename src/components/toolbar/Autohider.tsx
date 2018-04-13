import * as React from 'react';

export interface AutohiderProps {
  onLoseFocus: () => void;
}

export class Autohider
  extends React.PureComponent<AutohiderProps> {

  component: any;

  componentDidMount() {
    this.component.focus();
  }

  render() {
    return (
      <div tabIndex={0} ref={r => this.component = r} onBlur={this.props.onLoseFocus}>
        {this.props.children}
      </div>
    );
  }
}
