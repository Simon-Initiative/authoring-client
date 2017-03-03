'use strict'

import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';

import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { ContentState, EditorState } from 'draft-js';
import { AbstractContentEditor } from '../common/AbstractContentEditor';

export interface HtmlContentEditor {
  _onChange: (e: any) => void;
}

export interface HtmlContentEditorProps {

  // Whether or not editing is allowed for this user for this content
  editingAllowed : boolean;

  // Initial content to display
  content: contentTypes.HtmlContent;

  onEdit: (newContent: contentTypes.HtmlContent) => void;
  
}

export interface HtmlContentEditorState {

  activeContent: contentTypes.HtmlContent;

}

/**
 * The content editor for HtmlContent.
 */
export abstract class HtmlContentEditor extends AbstractContentEditor<HtmlContentEditorProps, HtmlContentEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      activeContent: this.props.content
    }

    this._onChange = this.onChange.bind(this);
  }

  onChange(content: contentTypes.HtmlContent) {
    this.props.onEdit(content);
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
      <div>
        <DraftWrapper 
            editHistory={[]} 
            content={this.state.activeContent} 
            locked={!this.props.editingAllowed}
            onEdit={this._onChange} />
      </div>);
  }

}

