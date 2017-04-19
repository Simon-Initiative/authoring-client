
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


export interface Choice {
}

export interface ChoiceProps extends AbstractContentEditorProps<contentTypes.Choice> {
  onRemove: (choice: contentTypes.Choice) => void;
}

export interface ChoiceState {

  editHistory: Immutable.List<AuthoringActions>;

}

/**
 * The content editor for HtmlContent.
 */
export class Choice 
  extends AbstractContentEditor<contentTypes.Choice, ChoiceProps, ChoiceState> {
    
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

  onBodyEdit(body) {
    const concept = this.props.model.with({body});
    this.props.onEdit(concept);
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
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    return (
      <InputLabel label="Choice" style="default" onRemove={this.props.onRemove.bind(this, this.props.model)}>
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
      </InputLabel>);
  }

}

