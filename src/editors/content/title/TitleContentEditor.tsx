'use strict'

import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';


export interface TitleContentEditor {
  _onChange: (e: any) => void;
}

export interface TitleContentEditorProps extends AbstractContentEditorProps {

  // Initial content to display
  content: contentTypes.TitleContent;

  onEdit: (newContent: contentTypes.TitleContent) => void;

}

export interface TitleContentEditorState {

  activeContent: contentTypes.TitleContent;

}

/**
 * The abstract content editor. 
 */
export abstract class TitleContentEditor extends AbstractContentEditor<TitleContentEditorProps, TitleContentEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      activeContent: this.props.content
    }

    this._onChange = this.onChange.bind(this);
  }

  onChange() {
    const text = ((this.refs as any).text as any).innerHTML;
    const updatedContent : contentTypes.TitleContent = this.state.activeContent.with({ title: { '#text': text } });
    this.setState({activeContent: updatedContent});
    this.props.onEdit(updatedContent);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.content !== nextProps.content) {
      this.setState({
        activeContent: nextProps.content
      })
    }
  }

  renderView(): JSX.Element {
    return <p>{this.state.activeContent.title['#text']}</p>;
  }

  renderEdit(): JSX.Element {
    const html = { __html: this.state.activeContent.title['#text'] };
    return <div ref='text' onInput={this._onChange} 
      contentEditable dangerouslySetInnerHTML={html}></div>;
  }

  render() : JSX.Element {
    if (this.props.editMode) {
      return this.renderEdit();
    } else {
      return this.renderView();
    }
  }

}

