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

  select: number;
}

/**
 * The content editor for HtmlContent.
 */
export class MultipleChoice 
  extends AbstractItemPartEditor<contentTypes.MultipleChoice, MultipleChoiceProps, MultipleChoiceState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: [],
      select: this.props.itemModel.select
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

  componentWillReceiveProps(nextProps) {
    this.setState({ select: nextProps.itemModel.select});
  }

  onSelectChange(e) {
    this.props.onEdit(this.props.itemModel.with({select: e.target.value}), this.props.partModel);
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

  renderChoices() {
    return this.props.itemModel.choices.toArray().map(c => {
      return (
        <Choice 
              key={c.guid}
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
           <label htmlFor={this.ids.select} className="col-2 col-form-label">Select</label>
           <input className="form-control form-control-sm" type="text" value={this.state.select} id={this.ids.select}/>

           <button onClick={this.onAddChoice} type="button" className="btn btn-sm btn-primary">Add Choice</button>
        </form>

        {this.renderChoices()}

      </div>);
  }

}

