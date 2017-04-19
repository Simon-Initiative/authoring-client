
import * as React from 'react';
import * as Immutable from 'immutable';
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
import { TextInput, InlineForm, Button, Checkbox, Select } from '../common/controls';
import { Collapse } from '../common/Collapse';
import { getHtmlDetails } from '../common/details';

import '../common/editor.scss';

type IdTypes = {
  availability: string
}

export interface ContentEditor {
  ids: IdTypes;
}

export interface ContentEditorProps extends AbstractContentEditorProps<contentTypes.Content> {

}

export interface ContentEditorState {

  editHistory: Immutable.List<AuthoringActions>;
}

/**
 * The content editor for HtmlContent.
 */
export class ContentEditor 
  extends AbstractContentEditor<contentTypes.Content, ContentEditorProps, ContentEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: Immutable.List<AuthoringActions>()
    };
    this.ids = {
      availability: guid()
    }
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onAvailability = this.onAvailability.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: this.state.editHistory.insert(0, action)
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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextState.editHistory !== this.state.editHistory) {
      return true;
    }
    return false;
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar 
                courseId={this.props.context.courseId} 
                services={this.props.services} 
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                documentId={this.props.context.documentId}
                courseId={this.props.context.courseId} 
                services={this.props.services} 
                actionHandler={this} />;

    const bodyStyle = {
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    const expanded = (
      <InlineForm position='right'>
        <Select onChange={this.onAvailability} label='Availability' value={this.props.model.availability}>
          <option value="always">Always</option>
          <option value="instructor_only">Instructor Only</option>
          <option value="feedback_only">Feedback Only</option>
          <option value="never">Never</option>
        </Select>
      </InlineForm>
    )

    return (
      <Collapse 
        caption='Content' 
        details={getHtmlDetails(this.props.model.body)}
        expanded={expanded}>
        
        <HtmlContentEditor 
              editorStyles={bodyStyle}
              inlineToolbar={inlineToolbar}
              blockToolbar={blockToolbar}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              editHistory={this.state.editHistory}
              model={this.props.model.body}
              onEdit={this.onBodyEdit} 
              />
      </Collapse>);
  }

}

