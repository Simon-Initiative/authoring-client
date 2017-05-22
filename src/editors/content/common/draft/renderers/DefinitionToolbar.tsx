import * as React from 'react';

export interface DefinitionToolbarProps {  
  onAddTitle: () => void;
  onAddPronunciation: () => void;
  onAddTranslation: () => void;
  onAddMeaning: () => void;
}

export interface DefinitionToolbar {
  
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

export class DefinitionToolbar 
  extends React.PureComponent<DefinitionToolbarProps, {}> {

  button(icon, handler, enabled, tooltip) {
    return <Button icon={icon} handler={handler} enabled={enabled} tooltip={tooltip}/>;
  }

  render() {
    return (
      <div>
        <div className="btn-group btn-group-sm" role="group" aria-label="Definition Toolbar">
          
          {this.button('info', this.props.onAddTitle, true, 'Add Title')}
          {this.button('microphone', this.props.onAddPronunciation, true, 'Add Pronunciation')}
          {this.button('map-signs', this.props.onAddTranslation, true, 'Add Translation')}
          {this.button('lightbulb-o', this.props.onAddMeaning, true, 'Add Meaning')}
          
        </div>
      </div>
    );
  }

}

export default DefinitionToolbar;
