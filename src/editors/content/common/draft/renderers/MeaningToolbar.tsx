import * as React from 'react';

export interface MeaningToolbarProps {  
  onAddExample: () => void;
}

export interface MeaningToolbar {
  
}

class Button extends React.Component<any, any> {

  buttonRef: any;

  componentDidMount() {
    (window as any).$(this.buttonRef).tooltip();
  }

  componentWillUnmount() {
    (window as any).$(this.buttonRef).tooltip('hide');
  }

  render() {
    const iconClasses = 'icon icon-' + this.props.icon;
    const style = {
      color: 'white',
    };
    const buttonStyle = {
      backgroundColor: 'black',
    };
    return (
      <button 
        ref={a => this.buttonRef = a}
        disabled={!this.props.enabled} onClick={this.props.handler}
        data-toggle="tooltip"
        data-placement="top"
        title={this.props.tooltip} 
        type="button" className="btn" style={buttonStyle}>
        <i style={style} className={iconClasses}></i>
      </button>
    );
  }
}

export class MeaningToolbar 
  extends React.PureComponent<MeaningToolbarProps, {}> {

  button(icon, handler, enabled, tooltip) {
    return <Button icon={icon} handler={handler} enabled={enabled} tooltip={tooltip}/>;
  }

  render() {
    return (
      <div>
        <div className="btn-group btn-group-sm" role="group" aria-label="Meaning Toolbar">
          
          {this.button('bar-chart', this.props.onAddExample, true, 'Add Example')}
          
        </div>
      </div>
    );
  }

}

export default MeaningToolbar;
