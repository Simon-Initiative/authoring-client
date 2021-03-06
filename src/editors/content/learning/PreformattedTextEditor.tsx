import * as React from 'react';

import { getCaretPosition, setCaretPosition } from '../common/caret';

require('./PreformattedText.scss');

const BACKSPACE = 8;

interface PreformattedTextEditor {
  _onChange: any;
  _onKeyPress: any;
  _onKeyUp: any;
  caretPosition: any;
  pre: any;
  direction: number;
}

export interface PreformattedTextEditorProps {
  onEdit: (src) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  editMode: boolean;
  src: string;
  styleName?: string;
}

export interface PreformattedTextEditorState {
  src: string;
}

class PreformattedTextEditor
  extends React.Component<PreformattedTextEditorProps, PreformattedTextEditorState> {

  public static defaultProps: Partial<PreformattedTextEditorProps> = {
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
      () => {
        try {
          setCaretPosition(target, this.caretPosition + this.direction);
        } catch (err) {
          // We swallow this exception to handle gracefully a myriad
          // of ways that the caret position cannot be set as requested
        }
      });

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

  render(): JSX.Element {

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

export default PreformattedTextEditor;
