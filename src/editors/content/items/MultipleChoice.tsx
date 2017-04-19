'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractItemPartEditor, AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import { Choice } from './Choice';
import { FeedbackEditor } from '../part/FeedbackEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';

import '../common/editor.scss';

type IdTypes = {
  select: string,
  shuffle: string
}

export interface MultipleChoice {
  ids: IdTypes;
}

export interface MultipleChoiceProps extends AbstractItemPartEditorProps<contentTypes.MultipleChoice> {

  blockKey?: string;

  activeSubEditorKey?: string; 

}

export interface MultipleChoiceState {

  editHistory: AuthoringActions[];

}

const ChoiceFeedback = (props) => {

}

/**
 * The content editor for HtmlContent.
 */
export class MultipleChoice 
  extends AbstractItemPartEditor<contentTypes.MultipleChoice, MultipleChoiceProps, MultipleChoiceState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: []
    };
    this.ids = {
      select: guid(),
      shuffle: guid()
    }
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onShuffleChange = this.onShuffleChange.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: [action, ...this.state.editHistory]
    });
  }

  onShuffleChange(e) {
    this.props.onEdit(this.props.itemModel.with({shuffle: e.target.value}), this.props.partModel);
  }

  onAddChoice() {
    let content = new contentTypes.Choice();
    content = content.with({guid: guid()});
    this.props.onEdit(this.props.itemModel.with({choices: this.props.itemModel.choices.set(content.guid, content) }), this.props.partModel);
  }

  onChoiceEdit(c) {
    this.props.onEdit(this.props.itemModel.with({choices: this.props.itemModel.choices.set(c.guid, c) }), this.props.partModel);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback) {
    response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    let part = this.props.partModel.with({responses: this.props.partModel.responses.set(response.guid, response) });
    this.props.onEdit(this.props.itemModel, part);
  }

  renderChoice(choice: contentTypes.Choice) {
    return <Choice 
              key={choice.guid}
              titleOracle={this.props.titleOracle}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              courseId={this.props.courseId}
              documentId={this.props.documentId}
              userId={this.props.userId}
              model={choice}
              onEdit={this.onChoiceEdit} 
              editingAllowed={this.props.editingAllowed}/>;
  }

  renderFeedback(response : contentTypes.Response, feedback: contentTypes.Feedback) {
    return <FeedbackEditor 
              titleOracle={this.props.titleOracle}
              key={feedback.guid}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              courseId={this.props.courseId}
              documentId={this.props.documentId}
              userId={this.props.userId}
              model={feedback}
              onEdit={this.onFeedbackEdit.bind(this, response)} 
              editingAllowed={this.props.editingAllowed}/>
  }

  renderChoices() {

    const responses = this.props.partModel.responses.toArray();
    const choices = this.props.itemModel.choices.toArray();

    const rendered = [];

    for (let i = 0; i < choices.length; i++) {
      let c = choices[i];

      let renderedFeedback = null;

      if (responses.length > i) {
        if (responses[i].feedback.size > 0) {
          let f = responses[i].feedback.first();
          renderedFeedback = this.renderFeedback(responses[i], f)
        }
      }
      
      rendered.push(
        <div>
          {this.renderChoice(c)}
          {renderedFeedback}
        </div>);
    }

    return rendered;
  }

  render() : JSX.Element {
    
    const bodyStyle = {
      minHeight: '75px',
      borderStyle: 'solid',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    return (
      <div className='itemWrapper'>

        <form className="form-inline">
           <label className="form-check-label">
              <input type="checkbox" className="form-check-input"/>Shuffle
              
            </label>
           
           <button onClick={this.onAddChoice} type="button" className="btn btn-sm btn-primary">Add Choice</button>
        </form>

        {this.renderChoices()}

      </div>);
  }

}

