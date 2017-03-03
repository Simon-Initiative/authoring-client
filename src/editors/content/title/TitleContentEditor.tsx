'use strict'

import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor } from '../common/AbstractContentEditor';


export interface TitleContentEditor {
  _onChange: (e: any) => void;
}

export interface TitleContentEditorProps {

  // Whether or not editing is allowed for this user for this content
  editingAllowed : boolean;

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

  onChange(e) {
    const text = e.target.value;
    const updatedContent : contentTypes.TitleContent = this.state.activeContent.with({ text });
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

  render() : JSX.Element {
    return ( 
      <div className="input-group">
          <input onChange={this._onChange} ref='title' type="text" 
            value={this.state.activeContent.text}
            className="form-input" placeholder="Enter title..." />
      </div>);
  }

}

