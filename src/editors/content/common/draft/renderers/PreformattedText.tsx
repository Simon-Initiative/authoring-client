import * as React from 'react';

import { getCaretPosition, setCaretPosition } from '../utils';

require('./PreformattedText.scss');

const BACKSPACE = 8;

interface PreformattedText {
  _onChange: any;
  _onKeyPress: any;
  _onKeyUp: any;
  caretPosition: any;
  pre: any;
  direction: number;
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

class PreformattedText extends React.Component<PreformattedTextProps, PreformattedTextState> {

  public static defaultProps: Partial<PreformattedTextProps> = {
    styleName: 'PreformattedText-code',
  };

  constructor(props) {
    super(props);
    this.state = {
      src: this.props.src,
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
    const currentText = target.innerText;

    this.setState(
      { src: currentText },
      () => setCaretPosition(target, this.caretPosition + this.direction));

    // Persist this change
    this.props.onEdit({ src: currentText });
  }

  onKeyPress(e) {

    if (e.keyCode === BACKSPACE) {
      this.direction = -1;
    } else {
      this.direction = 1;
    }

    // Keep track of the position of caret
    this.caretPosition = getCaretPosition(e.target);


  }

  onKeyUp(e) {
    e.stopPropagation();
  }

  render() : JSX.Element {

    // We cannot use JSX here to render this div because
    // the TypeScript type definitions do not seem to
    // recognize 'suppressContentEditableWarning' as a valid
    // property.

    return React.createElement(('pre' as any), {
      ref: component => this.pre = component,
      contentEditable: this.props.editMode,
      suppressContentEditableWarning: true,
      children: this.state.src,
      className: this.props.styleName,
      onInput: this._onChange,
      onKeyDown: this._onKeyPress,
      onKeyUp: this._onKeyUp,
    });

  }
}

export default PreformattedText;
