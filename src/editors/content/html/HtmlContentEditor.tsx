'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { CommandProcessor, Command } from '../common/command';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

import '../common/editor.scss';

export type ChangePreviewer = (current: contentTypes.Html, next: contentTypes.Html) => contentTypes.Html;

export interface HtmlContentEditor {
  _onChange: (e: any) => void;
  container: any;
  draft: any;
}

export interface HtmlContentEditorProps extends AbstractContentEditorProps<contentTypes.Html> {
  
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
  extends AbstractContentEditor<contentTypes.Html, HtmlContentEditorProps, HtmlContentEditorState>
  implements CommandProcessor<EditorState> {
    
  constructor(props) {
    super(props);

    this._onChange = this.onChange.bind(this);
    this.container = null; 
    this.draft = null;
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
    if (nextProps.activeItemId !== this.props.activeItemId) {
      return true;
    }
    return false;
  }

  process(command: Command<EditorState>) {
    this.draft.process(command);
  }

  checkPrecondition(command: Command<EditorState>) {
    return this.draft.checkPrecondition(command);
  }

  render() : JSX.Element {
    return (
      <div className="form-control">
        
          <DraftWrapper
            ref={(draft) => this.draft = draft}
            activeItemId={this.props.activeItemId}
            changePreviewer={this.props.changePreviewer}
            editorStyles={this.props.editorStyles}
            inlineToolbar={this.props.inlineToolbar}
            blockToolbar={this.props.blockToolbar}
            onSelectionChange={this.onSelectionChange.bind(this)}
            services={this.props.services}
            context={this.props.context}
            content={this.props.model} 
            locked={!this.props.editMode}
            onEdit={this._onChange} />
        
      </div>);
  }

}

