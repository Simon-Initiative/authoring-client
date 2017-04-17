'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';

import '../common/editor.scss';

type IdTypes = {
  availability: string
}

export interface ContentEditor {
  ids: IdTypes;
}

export interface ContentEditorProps extends AbstractContentEditorProps<contentTypes.Content> {

  blockKey?: string;

  activeSubEditorKey?: string; 

}

export interface ContentEditorState {

  editHistory: AuthoringActions[];
}

/**
 * The content editor for HtmlContent.
 */
export class ContentEditor 
  extends AbstractContentEditor<contentTypes.Content, ContentEditorProps, ContentEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: []
    };
    this.ids = {
      availability: guid()
    }
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onAvailability = this.onAvailability.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: [action, ...this.state.editHistory]
    });
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({body});
    this.props.onEdit(concept);
  }

  onAvailability(e) {
    console.log(e.target.value);
    this.props.onEdit(this.props.model.with({availability: e.target.value}));
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
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    return (
      <div>
        <form className="form-inline">
           <label className="mr-sm-2" htmlFor={this.ids.availability}>Content availability</label>
            <select value={this.props.model.availability} onChange={this.onAvailability} className="form-control-sm custom-select mb-2 mr-sm-2 mb-sm-0" id={this.ids.availability}>
              <option value="always">Always</option>
              <option value="instructor_only">Instructor Only</option>
              <option value="feedback_only">Feedback Only</option>
              <option value="never">Never</option>
            </select>
        </form>

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
              editingAllowed={this.props.editingAllowed}/>

      </div>);
  }

}

