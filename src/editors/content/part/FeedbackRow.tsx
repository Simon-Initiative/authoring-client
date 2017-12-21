import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Collapse, Button } from '../common/controls';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';

export interface FeedbackRow {
  
}

export interface FeedbackRowProps extends AbstractContentEditorProps<contentTypes.Response> {
  onRemove: (model: contentTypes.Response) => void;
}

export interface FeedbackRowState {
  match: string;
  score: string;
}


/**
 * The content editor for HtmlContent.
 */
export abstract class FeedbackRow 
  extends AbstractContentEditor<contentTypes.Response, FeedbackRowProps, FeedbackRowState> {
    
  constructor(props) {
    super(props);

    const { match, score } = this.props.model;

    this.state = {
      match,
      score,
    };

    this.onBodyEdit = this.onBodyEdit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      match: nextProps.model.match,
      score: nextProps.model.score,
    });
  }

  onFeedbackEdit(model: contentTypes.Feedback) {
    const response = this.props.model.with({ feedback: this.props.model.feedback.set(model.guid, model) });
    this.props.onEdit(response);
  }

  onScore(e) {
    const response = this.props.model.with({ score: e.target.value });
    this.setState({ score: e.target.value }, () => this.props.onEdit(response));
  }

  onMatch(e) {
    const response = this.props.model.with({ match: e.target.value });
    this.setState({ match: e.target.value }, () => this.props.onEdit(response));
  }

  renderMatch(response: contentTypes.Response) {
    return (
      <input 
        disabled={!this.props.editMode}
        style={{ width:'65px', outline: 'none', display: 'inline' }}
        onChange={this.onMatch.bind(this)}
        value={this.state.match}/>);
  }

  renderScore(response: contentTypes.Response) {
    return (
      <input 
        disabled={!this.props.editMode}
        style={{ width:'65px', outline: 'none', display: 'inline' }}
        type="number"
        onChange={this.onScore.bind(this)}
        value={this.state.score}/>);
  }


  onBodyEdit(body) {

    let feedback = this.props.model.feedback.first();
    feedback = feedback.with({ body });
    const response = this.props.model.with(
      { feedback: this.props.model.feedback.set(feedback.guid, feedback) });
    this.props.onEdit(response);
  }

  renderFeedback(response: contentTypes.Response) {
    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const insertionToolbar = <InlineInsertionToolbar/>;

    const feedback = response.feedback.first();

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };
    return (
      <HtmlContentEditor 
        editorStyles={bodyStyle}
        inlineToolbar={inlineToolbar}
        blockToolbar={blockToolbar}
        inlineInsertionToolbar={insertionToolbar}
        {...this.props}
        model={feedback.body}
        onEdit={this.onBodyEdit} 
        />
    );
  }
  
  render() : JSX.Element {
    const r = this.props.model;
    return (
      <tr>
        <td style={{ width: '100px' }}>{this.renderMatch(r)}</td>
        <td style={{ width: '100px' }}>{this.renderScore(r)}</td>
        <td>{this.renderFeedback(r)}</td>
        <td><span className="closebtn input-group-addon" 
          onClick={() => this.props.onRemove(this.props.model)}>&times;</span>
        </td>
      </tr>
    );
  }

}

