'use strict'

import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';


export interface InlineAssessmentContentEditor {
  _onChange: (e: any) => void;
}

export interface InlineAssessmentContentEditorProps extends AbstractContentEditorProps {

  // Initial content to display
  content: contentTypes.InlineAssessmentContent;

  onEdit: (newContent: contentTypes.InlineAssessmentContent) => void;

}

export interface InlineAssessmentContentEditorState {

  activeContent: contentTypes.InlineAssessmentContent;

}

/**
 * The abstract content editor. 
 */
export abstract class InlineAssessmentContentEditor extends AbstractContentEditor<InlineAssessmentContentEditorProps, InlineAssessmentContentEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      activeContent: this.props.content
    }

    this._onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const timeLimit = e.target.value;
    const updatedContent : contentTypes.InlineAssessmentContent = this.state.activeContent.with({ timeLimit });
    this.setState({activeContent: updatedContent});
    this.props.onEdit(updatedContent);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.content !== nextProps.content) {
      this.setState({
        activeContent: nextProps.content
      })
    }
  }

  render() : JSX.Element {
    
    let input;
    if (this.props.editMode) {
      input = <input className="form-input" onChange={this._onChange} ref='timeLimit' 
            type="text" value={this.state.activeContent.timeLimit} placeholder="Name" />
    } else {
      input = <input disabled className="form-input" onChange={this._onChange} ref='timeLimit' 
            type="text" value={this.state.activeContent.timeLimit} placeholder="Name" />
    }
    
    return <form className="form-horizontal">
      <div className="form-group">
        <div className="col-3">
          <label className="form-label">Time Limit</label>
        </div>
        <div className="col-9">
          {input}
        </div>
      </div>
    </form>
  
  }

}

