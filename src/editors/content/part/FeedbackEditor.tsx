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
import { InputLabel } from '../common/InputLabel';

import '../common/editor.scss';


export interface FeedbackEditor {
  
}

export interface FeedbackEditorProps extends AbstractContentEditorProps<contentTypes.Feedback> {
  showLabel: boolean;
  onRemove: (feedback: contentTypes.Feedback) => void;
}

export interface FeedbackEditorState {

  editHistory: Immutable.List<AuthoringActions>;

}

/**
 * The content editor for HtmlContent.
 */
export class FeedbackEditor 
  extends AbstractContentEditor<contentTypes.Feedback, FeedbackEditorProps, FeedbackEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: Immutable.List<AuthoringActions>()
    };
    this.onBodyEdit = this.onBodyEdit.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: this.state.editHistory.insert(0, action)
    });
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

  onBodyEdit(body) {
    const concept = this.props.model.with({body});
    this.props.onEdit(concept);
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar 
                context={this.props.context} 
                services={this.props.services} 
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                context={this.props.context}
                services={this.props.services} 
                actionHandler={this} />;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    const label = this.props.showLabel ? 'Feedback' : undefined;
    
    return (
      <InputLabel label={label} onRemove={this.props.onRemove.bind(this)}>

        <HtmlContentEditor 
              editorStyles={bodyStyle}
              inlineToolbar={inlineToolbar}
              blockToolbar={blockToolbar}
              {...this.props}
              editHistory={this.state.editHistory}
              model={this.props.model.body}
              onEdit={this.onBodyEdit} 
              />
      </InputLabel>);
  }

}

