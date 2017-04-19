'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import { FeedbackEditor } from './FeedbackEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';

import '../common/editor.scss';

type IdTypes = {
  input: string,
  match: string,
  score: string,
  name: string
}

export interface ResponseEditor {
  ids: IdTypes;
}

export interface ResponseEditorProps extends AbstractContentEditorProps<contentTypes.Response> {

  

}

export interface ResponseEditorState {

  input: string,
  match: string,
  score: string,
  name: string

}

/**
 * The content editor for HtmlContent.
 */
export class ResponseEditor 
  extends AbstractContentEditor<contentTypes.Response, ResponseEditorProps, ResponseEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      input: this.props.model.input,
      match: this.props.model.match,
      score: this.props.model.score,
      name: this.props.model.name
      
    };
    this.ids = {
      input: guid(),
      match: guid(),
      score: guid(),
      name: guid()
    }
    this.onAddFeedback = this.onAddFeedback.bind(this);
    this.onMatchChange = this.onMatchChange.bind(this);
    this.onScoreChange = this.onScoreChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onFeedbackEdit = this.onFeedbackEdit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ 
      input: nextProps.model.input,
      match: nextProps.model.match,
      score: nextProps.model.score,
      name: nextProps.model.name
    
    });
  }

  onInputChange(e) {
    const input = e.target.value;
    this.setState({ input }, () => this.props.onEdit(this.props.model.with({ input })));
  }

  onMatchChange(e) {
    const match = e.target.value;
    this.setState({ match }, () => this.props.onEdit(this.props.model.with({ match })));
  }

  onScoreChange(e) {
    const score = e.target.value;
    this.setState({ score }, () => this.props.onEdit(this.props.model.with({ score })));
  }

  onNameChange(e) {
    const name = e.target.value;
    this.setState({ name }, () => this.props.onEdit(this.props.model.with({ name })));
  }

  onAddFeedback() {
    let content = new contentTypes.Feedback();
    content = content.with({guid: guid()});
    this.props.onEdit(this.props.model.with({feedback: this.props.model.feedback.set(content.guid, content) }));
  }

  onFeedbackEdit(c) {
    this.props.onEdit(this.props.model.with({feedback: this.props.model.feedback.set(c.guid, c) }));
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  renderFeedback() {
    return this.props.model.feedback.toArray().map(c => {
      return (
        <FeedbackEditor 
              context={this.props.context}
              key={c.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              model={c}
              onEdit={this.onFeedbackEdit} 
              onRemove={null}
              />
      )
    })
  }

  render() : JSX.Element {
    const style = {
      width: '80px'
    }
    return (
      <div className='editorWrapper'>

        <form className="form-inline">
           
          Input&nbsp;&nbsp;
          <input style={style} className="form-control form-control-sm" type="text" value={this.state.input} id={this.ids.input}/>
      
          &nbsp;&nbsp;Match&nbsp;&nbsp;
          <input style={style} className="form-control form-control-sm" type="text" value={this.state.match} id={this.ids.match}/>
      
          &nbsp;&nbsp;Score&nbsp;&nbsp;
          <input style={style} className="form-control form-control-sm" type="text" value={this.state.score} id={this.ids.score}/>
      
          &nbsp;&nbsp;Name&nbsp;&nbsp;
          <input style={style} className="form-control form-control-sm" type="text" value={this.state.name} id={this.ids.name}/>
         
          &nbsp;&nbsp;
          <button onClick={this.onAddFeedback} type="button" className="btn btn-sm btn-primary">Add Feedback</button>
        </form>

        {this.renderFeedback()}

      </div>);
  }

}

