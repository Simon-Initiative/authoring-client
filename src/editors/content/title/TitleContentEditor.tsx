import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor,
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { removeHTML, getCaretPosition,
  setCaretPosition, getSelectionRange } from '../../content/common/draft/utils';

const BACKSPACE = 8;

export interface TitleContentEditorProps extends AbstractContentEditorProps<contentTypes.Title> {
  styles?: Object;
}

export class TitleContentEditor
  extends AbstractContentEditor<contentTypes.Title, TitleContentEditorProps, { text }> {
  caretPosition: any;
  direction: number;

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.state = {
      text: this.props.model.text,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.text !== nextState.text) {
      return true;
    }

    return false;
  }

  onChange(e) {

    const target = e.target;
    const currentText = target.innerText;

    this.setState(
      { text: currentText },
      () => setCaretPosition(target, this.caretPosition + this.direction));

    // Persist this change
    const updatedContent = this.props.model.with({ text: currentText });
    this.props.onEdit(updatedContent);

  }

  componentWillReceiveProps(nextProps: TitleContentEditorProps) {
    if (nextProps.context.undoRedoGuid !== this.props.context.undoRedoGuid) {
      this.setState({ text: nextProps.model.text });
    } else if (nextProps.model.guid !== this.props.model.guid) {
      this.setState({ text: nextProps.model.text });
    }
  }

  renderView(): JSX.Element {
    if (this.props.styles) {
      return <div style={this.props.styles}>{this.props.model.text}</div>;
    }

    return <div>{this.props.model.text}</div>;
  }

  onKeyPress(e) {
    // Keep track of the position of caret

    const range : any = getSelectionRange(e.target);
    if (range.endOffset - range.startOffset > 0) {
      this.caretPosition = range.startOffset;

      if (e.keyCode === BACKSPACE) {
        this.direction = 0;
      } else {
        this.direction = 1;
      }
    } else {
      this.caretPosition = getCaretPosition(e.target);
      if (e.keyCode === BACKSPACE) {
        this.direction = -1;
      } else {
        this.direction = 1;
      }
    }

  }

  onKeyUp(e) {
    e.stopPropagation();
  }

  renderEdit(): JSX.Element {

    const html = { __html: this.state.text };
    const style = this.props.styles ? this.props.styles : {};

    return (
      <h2
        style={this.props.styles}
        ref="text"
        onInput={this.onChange}
        onKeyDown={this.onKeyPress}
        onKeyUp={this.onKeyUp}
        contentEditable
        dangerouslySetInnerHTML={html}/>
    );

  }

  render() : JSX.Element {
    if (this.props.editMode) {
      return this.renderEdit();
    }

    return this.renderView();
  }

}
