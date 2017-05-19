import * as React from 'react';

export interface DefinitionToolbarProps {  
  onAddTitle: () => void;
  onAddPronunciation: () => void;
  onAddTranslation: () => void;
  onAddMeaning: () => void;
}

export interface DefinitionToolbar {
  
}

export class DefinitionToolbar 
  extends React.PureComponent<DefinitionToolbarProps, {}> {

  button(icon, handler, enabled) {
    const iconClasses = 'icon icon-' + icon;
    const style = {
      color: 'white',
    };
    const buttonStyle = {
      backgroundColor: 'black',
    };
    return (
      <button disabled={!enabled} onClick={handler} 
        type="button" className="btn" style={buttonStyle}>
        <i style={style} className={iconClasses}></i>
      </button>
    );
  }

  render() {
    return (
      <div style={ { float: 'right' } }>
        <div className="btn-group btn-group-sm" role="group" aria-label="Definition Toolbar">
          
          {this.button('info', this.props.onAddTitle, true)}
          {this.button('microphone', this.props.onAddPronunciation, true)}
          {this.button('map-signs', this.props.onAddTranslation, true)}
          {this.button('book', this.props.onAddMeaning, true)}
          
        </div>
      </div>
    );
  }

}

export default DefinitionToolbar;
