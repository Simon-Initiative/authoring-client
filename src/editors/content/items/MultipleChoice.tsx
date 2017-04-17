'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import { Choice } from './Choice';
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

export interface MultipleChoiceProps extends AbstractContentEditorProps<contentTypes.MultipleChoice> {

  blockKey?: string;

  activeSubEditorKey?: string; 

}

export interface MultipleChoiceState {

  editHistory: AuthoringActions[];

  select: number;
}

/**
 * The content editor for HtmlContent.
 */
export class MultipleChoice 
  extends AbstractContentEditor<contentTypes.MultipleChoice, MultipleChoiceProps, MultipleChoiceState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: [],
      select: this.props.model.select
    };
    this.ids = {
      select: guid(),
      shuffle: guid()
    }
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onShuffleChange = this.onShuffleChange.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: [action, ...this.state.editHistory]
    });
  }

  componentWillReceiveProps(nextState) {
    this.setState({ select: this.props.model.select});
  }

  onSelectChange(e) {
    this.props.onEdit(this.props.model.with({select: e.target.value}));
  }

  onShuffleChange(e) {
    this.props.onEdit(this.props.model.with({shuffle: e.target.value}));
  }

  onAddChoice() {
    let content = new contentTypes.Choice();
    content = content.with({guid: guid()});
    this.props.onEdit(this.props.model.with({choices: this.props.model.choices.set(content.guid, content) }));
  }

  onChoiceEdit(c) {
    this.props.onEdit(this.props.model.with({choices: this.props.model.choices.set(c.guid, c) }));
  }

  renderChoices() {
    return this.props.model.choices.toArray().map(c => {
      return (
        <Choice 
              key={c.guid}
              activeSubEditorKey={this.props.activeSubEditorKey}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              courseId={this.props.courseId}
              documentId={this.props.documentId}
              userId={this.props.userId}
              model={c}
              onEdit={this.onChoiceEdit} 
              editingAllowed={this.props.editingAllowed}/>
      )
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
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    return (
      <div>

        <form className="form-inline">
           <label className="form-check-label">
              <input type="checkbox" className="form-check-input"/>Shuffle
              
            </label>
           <label htmlFor={this.ids.select} className="col-2 col-form-label">Select</label>
           <input className="form-control form-control-sm" type="text" value={this.state.select} id={this.ids.select}/>

           <button onClick={this.onAddChoice} type="button" className="btn btn-sm btn-primary">Add Choice</button>
        </form>

        {this.renderChoices()}

      </div>);
  }

}

