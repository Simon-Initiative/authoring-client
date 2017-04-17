'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

import '../common/editor.scss';

export interface HtmlContentEditor {
  _onChange: (e: any) => void;
  container: any;
}

export interface HtmlContentEditorProps extends AbstractContentEditorProps<contentTypes.Html> {
  
  editHistory: AuthoringActions[];
  
  blockKey?: string;

  activeSubEditorKey?: string; 

  inlineToolbar: any;

  blockToolbar: any;
}

export interface HtmlContentEditorState {

  selectionState: SelectionState;
}

/**
 * The content editor for HtmlContent.
 */
export abstract class HtmlContentEditor 
  extends AbstractContentEditor<contentTypes.Html, HtmlContentEditorProps, HtmlContentEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      selectionState: null
    }

    this._onChange = this.onChange.bind(this);
    this.container = null; 
  }


  onChange(content: contentTypes.Html) {
    this.props.onEdit(content);
  } 

  onSelectionChange(selectionState) {
    this.setState({selectionState});
  }

  render() : JSX.Element {
    return (
      <div>
        
          <DraftWrapper 
            inlineToolbar={this.props.inlineToolbar}
            blockToolbar={this.props.blockToolbar}
            onSelectionChange={this.onSelectionChange.bind(this)}
            onEditModeChange={this.props.onEditModeChange}
            services={this.props.services}
            userId={this.props.userId}
            editHistory={this.props.editHistory} 
            content={this.props.model} 
            locked={!this.props.editingAllowed || !this.props.editMode}
            onEdit={this._onChange} />
        
      </div>);
  }

}

