import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Collapse, Button } from '../common/controls';
import { FeedbackEditor } from './FeedbackEditor';

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
      score
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      match: nextProps.model.match,
      score: nextProps.model.score
    })
  }

  onFeedbackEdit(model: contentTypes.Feedback) {
    const response = this.props.model.with({feedback: this.props.model.feedback.set(model.guid, model)});
    this.props.onEdit(response);
  }

  onScore(e) {
    const response = this.props.model.with({score: e.target.value});
    this.setState({score: e.target.value}, () => this.props.onEdit(response));
  }

  onMatch(e) {
    const response = this.props.model.with({match: e.target.value});
    this.setState({match: e.target.value}, () => this.props.onEdit(response));
  }

  renderMatch(response: contentTypes.Response) {
    return (
      <input 
        style={{width:'65px', outline: 'none', display: 'inline'}}
        onChange={this.onMatch.bind(this)}
        value={this.state.match}/>);
  }

  renderScore(response: contentTypes.Response) {
    return (
      <input 
        style={{width:'65px', outline: 'none', display: 'inline'}}
        type='number'
        onChange={this.onScore.bind(this)}
        value={this.state.score}/>);
  }

  renderFeedback(response: contentTypes.Response) {
    return (
      <div className="input-group">
        <FeedbackEditor
          {...this.props}
          showLabel={false}
          model={response.feedback.first()}
          onEdit={this.onFeedbackEdit.bind(this)} 
          onRemove={this.props.onRemove.bind(this, this.props.model)}
        />
      </div>
    )
  }
  
  render() : JSX.Element {
    const r = this.props.model;
    return (
      <tr>
        <td style={{width: '100px'}}>{this.renderMatch(r)}</td>
        <td style={{width: '100px'}}>{this.renderScore(r)}</td>
        <td>{this.renderFeedback(r)}</td>
      </tr>
    )
  }

}

