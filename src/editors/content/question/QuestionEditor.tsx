'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

import '../common/editor.scss';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import { UnsupportedEditor } from '../unsupported/UnsupportedEditor';
import { MultipleChoice } from '../items/MultipleChoice';

import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';

export interface QuestionEditor {
  
}

export interface QuestionEditorProps extends AbstractContentEditorProps<contentTypes.Question> {

  blockKey?: string;

  activeSubEditorKey?: string; 

}

export interface QuestionEditorState {

  editHistory: AuthoringActions[];
}

/**
 * The content editor for HtmlContent.
 */
export abstract class QuestionEditor 
  extends AbstractContentEditor<contentTypes.Question, QuestionEditorProps, QuestionEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: []
    };

    this.onBodyEdit = this.onBodyEdit.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: [action, ...this.state.editHistory]
    });
  }

  onBodyEdit(body) {
    const question = this.props.model.with({body});
    this.props.onEdit(question);
  }

  onItemEdit(item) {
    
    this.props.onEdit(this.props.model.with({items: this.props.model.items.set(item.guid, item) }));
    
  }

  renderItems() {
    return this.props.model.items.toArray().map(i => {
      if (i.contentType === 'MultipleChoice') {
            return <MultipleChoice
              key={i.guid}
              documentId={this.props.documentId}
              courseId={this.props.courseId}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              model={i}
              onEdit={(c) => this.onItemEdit(c)} 
              editingAllowed={this.props.editingAllowed}/>
      } else {
        return <UnsupportedEditor
              key={i.guid}
              documentId={this.props.documentId}
              courseId={this.props.courseId}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              model={i}
              onEdit={(c) => {}} 
              editingAllowed={this.props.editingAllowed}/>
      }
    })
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar 
                courseId={this.props.courseId} 
                services={this.props.services} 
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                documentId={this.props.documentId}
                courseId={this.props.courseId} 
                services={this.props.services} 
                actionHandler={this} />;

    const bodyStyle = {
      minHeight: '75px',
      borderStyle: 'solid',
      borderWith: '1px',
      borderColor: '#AAAAAA'
    }

    return (
      <div>
        <div>Question Body</div>
        <HtmlContentEditor 
              editorStyles={bodyStyle}
              inlineToolbar={inlineToolbar}
              blockToolbar={blockToolbar}
              activeSubEditorKey={this.props.activeSubEditorKey}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              courseId={this.props.courseId}
              documentId={this.props.documentId}
              userId={this.props.userId}
              editHistory={this.state.editHistory}
              model={this.props.model.body}
              onEdit={this.onBodyEdit} 
              editingAllowed={this.props.editingAllowed}
              
              />

        {this.renderItems()}

      </div>);
  }

}

