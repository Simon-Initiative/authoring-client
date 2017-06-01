import * as React from 'react';

import { removeHTML, getCaretPosition, setCaretPosition } from '../utils';

require('./PreformattedText.scss');
 
interface PreformattedText {
  _onChange: any;
  _onKeyPress: any;
  _onKeyUp: any;
  caretPosition: any;
  pre: any;
}

export interface PreformattedTextProps {
  onEdit: (src) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  editMode: boolean;
  src: string; 
  styleName? : string;
}

export interface PreformattedTextState {
  src: string;
}

class PreformattedText extends React.PureComponent<PreformattedTextProps, PreformattedTextState> {

  public static defaultProps: Partial<PreformattedTextProps> = {
    styleName: "PreformattedText-code"
  };

  constructor(props) {
    super(props);
    this.state = {
      src: this.props.src
    };

    this._onChange = this.onChange.bind(this);
    this._onKeyPress = this.onKeyPress.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this.caretPosition = null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.src !== nextState.src);
  }

  onChange(e) {

    const target = e.target;
    const currentText = target.innerHTML;

    // Strip out any HTML introduced by how contentEditable 
    // handles processing the 'Enter' key
    const cleanedText = removeHTML(currentText);

    // If the cleaned text doesn't equal the original text then we
    // know that we did clean out some HTML. We need to restore the
    // caret position back as the browser will lose it and reset it
    // to the beginning of the div  
    if (cleanedText !== currentText) {

      if (this.caretPosition === null) {
        // Work around the browser quirk that an onKeyPress won't be 
        // called on the initial key press - which if the initial key
        // press is an 'Enter' we have no caret position information to go on

        // Instead find the first <div> in the currentText and use that as the
        // current caret position 
        const divPosition = currentText.indexOf('<div>');
        this.setState({src: cleanedText }, 
          () => setCaretPosition(target, divPosition + 1));
        console.log('set pos ' + divPosition);
      } else {
        console.log('set caret ' + this.caretPosition + 1);
        this.setState({src: cleanedText }, 
          () => setCaretPosition(target, this.caretPosition + 1));
      }
      
    } else {
      console.log('text equalled');
      this.setState({src: cleanedText }, 
          () => setCaretPosition(target, this.caretPosition + 1));
    }

    // Persist this change
    this.props.onEdit({src: cleanedText});
  }

  onKeyPress(e) {
    // Keep track of the position of caret 
    this.caretPosition = getCaretPosition(e.target);
    console.log('caretposition');
    console.log(this.caretPosition);
  }

  onKeyUp(e) {
    e.stopPropagation();
  }

  render() : JSX.Element {
    
    // We cannot use JSX here to render this div because
    // the TypeScript type definitions do not seem to
    // recognize 'suppressContentEditableWarning' as a valid
    // property. 

    console.log('pre redner');
    
    return React.createElement('pre', {
      ref: (component) => this.pre = component,
      contentEditable: this.props.editMode,
      suppressContentEditableWarning: true,
      children: this.state.src,
      className: this.props.styleName,
      onInput: this._onChange,
      onKeyPress: this._onKeyPress,
      onKeyUp: this._onKeyUp
    });

  }
};

export default PreformattedText;