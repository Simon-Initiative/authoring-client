import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, 
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { QuestionEditor } from '../question/QuestionEditor';
import { ContentEditor } from '../content/ContentEditor';

import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import { RemovableContent } from '../common/RemovableContent';
import guid from '../../../utils/guid';


import '../common/editor.scss';


export interface PoolEditor {
  
}

export interface PoolProps extends AbstractContentEditorProps<contentTypes.Pool> {
  onRemove: (guid: string) => void;
  isParentAssessmentGraded?: boolean;
}

export interface PoolState {

}


/**
 * The content editor for HtmlContent.
 */
export class PoolEditor 
  extends AbstractContentEditor<contentTypes.Pool, PoolProps, PoolState> {
    
  constructor(props) {
    super(props);
    
    this.onRemoveQuestion = this.onRemoveQuestion.bind(this);
    this.onEditQuestion = this.onEditQuestion.bind(this);
    this.onContentEdit = this.onContentEdit.bind(this);
    
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.model !== this.props.model);
  }

  onRemoveQuestion(guid) {

    if (this.props.model.questions.size > 1) {
      this.props.onEdit(this.props.model.with( 
        { questions: this.props.model.questions.delete(guid) }));
    }
    
  }

  onEditQuestion(question: contentTypes.Question) {
    this.props.onEdit(this.props.model.with(
      { questions: this.props.model.questions.set(question.guid, question) }));
  }

  onContentEdit(content) {
    this.props.onEdit(this.props.model.with({ content }));
  }

  renderQuestion(question: contentTypes.Question) {
    return <QuestionEditor
             key={question.guid}
             {...this.props}
             model={question}
             onEdit={this.onEditQuestion}
             onRemove={this.onRemoveQuestion}
           />;
  }

  render() : JSX.Element {
    
    return (
      <div>
        {this.props.model.questions.toArray().map(q => this.renderQuestion(q))}
      </div>
    );
  }

}

