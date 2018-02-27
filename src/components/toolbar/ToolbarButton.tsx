import * as React from 'react';


export type ToolbarButtonProps = {
  command: () => void,
  icon: string,
  tooltip: string,
  enabled: boolean,
};

export class ToolbarButton extends React.PureComponent<ToolbarButtonProps, {}> {

  buttonRef: any;

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.command();
  }

  render() {
    const { icon } = this.props;
    const iconClasses = 'fa fa-' + icon;
    const style = {
      color: 'white',
    };
    const buttonStyle = {
      backgroundColor: 'black',
    };

    return (
      <button
        ref={a => this.buttonRef = a}
        onClick={this.onClick}
        disabled={!this.props.enabled}
        type="button"
        className="btn"
        style={buttonStyle}>
        <i style={style} className={iconClasses}></i>
      </button>
    );
  }
}

