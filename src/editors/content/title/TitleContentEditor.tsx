import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, 
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { removeHTML, getCaretPosition, setCaretPosition } from '../../content/common/draft/utils';

import '../common/editor.scss';

export interface TitleContentEditor {
  caretPosition: any;
}

export interface TitleContentEditorProps extends AbstractContentEditorProps<contentTypes.Title> {

}

export class TitleContentEditor 
  extends AbstractContentEditor<contentTypes.Title, TitleContentEditorProps, { text }> {

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.state = {
      text: this.props.model.text,
    };
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
        this.setState(
          { text: cleanedText }, 
          () => setCaretPosition(target, divPosition + 1));
        
      } else {
        this.setState(
          { text: cleanedText }, 
          () => setCaretPosition(target, this.caretPosition + 1));
      }
      
    } else {
      this.setState( 
        { text: cleanedText }, 
        () => setCaretPosition(target, this.caretPosition + 1));
    }

    // Persist this change
    const updatedContent = this.props.model.with({ text: cleanedText });
    this.props.onEdit(updatedContent);
  
  }

  componentWillReceiveProps(nextProps: TitleContentEditorProps) {
    if (nextProps.context.undoRedoGuid !== this.props.context.undoRedoGuid) {
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
    this.caretPosition = getCaretPosition(e.target);
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
        onKeyPress={this.onKeyPress}
        onKeyUp={this.onKeyUp}
        contentEditable 
        dangerouslySetInnerHTML={html}/>
    );
    
  }

  render() : JSX.Element {
    if (this.props.editMode) {
      return this.renderEdit();
    } else {
      return this.renderView();
    }
  }

}
