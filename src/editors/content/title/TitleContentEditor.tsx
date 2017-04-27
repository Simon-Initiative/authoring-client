'use strict'

import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';


import '../common/editor.scss';

export interface TitleContentEditor {
  _onChange: (e: any) => void;
}

export interface TitleContentEditorProps extends AbstractContentEditorProps<contentTypes.Title> {

}

/**
 * The abstract content editor. 
 */
export abstract class TitleContentEditor extends AbstractContentEditor<contentTypes.Title, TitleContentEditorProps, {}> {

  constructor(props) {
    super(props);

    this._onChange = this.onChange.bind(this);
  }

  onChange() {
    const text = ((this.refs as any).text as any).innerHTML;
    const updatedContent : contentTypes.Title = this.props.model.with({ text });
    this.props.onEdit(updatedContent);
  }

  renderView(): JSX.Element {
    if (this.props.styles) {
      return <div style={this.props.styles}>{this.props.model.text}</div>;
    }    
      
    return <div>{this.props.model.text}</div>;
  }

  renderEdit(): JSX.Element {
    const html = { __html: this.props.model.text };
          
    if (this.props.styles) {
      return <h2 style={this.props.styles} ref='text' onInput={this._onChange} contentEditable dangerouslySetInnerHTML={html}></h2>;
    }     
          
    return <h2 ref='text' onInput={this._onChange} contentEditable dangerouslySetInnerHTML={html}></h2>;
  }

  render() : JSX.Element {
    if (this.props.editMode) {
      return this.renderEdit();
    } else {
      return this.renderView();
    }
  }

}

