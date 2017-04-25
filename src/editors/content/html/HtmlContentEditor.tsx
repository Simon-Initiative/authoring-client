'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

import '../common/editor.scss';

export type ChangePreviewer = (current: contentTypes.Html, next: contentTypes.Html) => contentTypes.Html;

export interface HtmlContentEditor {
  _onChange: (e: any) => void;
  container: any;
}

export interface HtmlContentEditorProps extends AbstractContentEditorProps<contentTypes.Html> {
  
  editHistory: Immutable.List<AuthoringActions>;
  
  inlineToolbar: any;

  blockToolbar: any;

  editorStyles?: Object;

  changePreviewer?: ChangePreviewer;

  activeItemId?: string;
}

export interface HtmlContentEditorState {

  
}

/**
 * The content editor for HtmlContent.
 */
export class HtmlContentEditor 
  extends AbstractContentEditor<contentTypes.Html, HtmlContentEditorProps, HtmlContentEditorState> {
    
  constructor(props) {
    super(props);

    this._onChange = this.onChange.bind(this);
    this.container = null; 
  }


  onChange(content: contentTypes.Html) {
    this.props.onEdit(content);
  } 

  onSelectionChange(selectionState) {
    this.setState({selectionState});
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.editHistory !== this.props.editHistory) {
      return true;
    }
    if (nextProps.activeItemId !== this.props.activeItemId) {
      return true;
    }
    return false;
  }

  render() : JSX.Element {
    return (
      <div className="form-control">
        
          <DraftWrapper 
            activeItemId={this.props.activeItemId}
            changePreviewer={this.props.changePreviewer}
            editorStyles={this.props.editorStyles}
            inlineToolbar={this.props.inlineToolbar}
            blockToolbar={this.props.blockToolbar}
            onSelectionChange={this.onSelectionChange.bind(this)}
            services={this.props.services}
            context={this.props.context}
            editHistory={this.props.editHistory} 
            content={this.props.model} 
            locked={!this.props.editMode}
            onEdit={this._onChange} />
        
      </div>);
  }

}

