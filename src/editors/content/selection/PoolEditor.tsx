import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, 
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { QuestionEditor } from '../question/QuestionEditor';
import { ContentEditor } from '../content/ContentEditor';
import { TitleContentEditor } from '../title/TitleContentEditor';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';

import '../common/editor.scss';


export interface PoolEditor {
  
}

export interface PoolProps extends AbstractContentEditorProps<contentTypes.Pool> {

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
    
    this.onAddQuestion = this.onAddQuestion.bind(this);
    this.onRemoveQuestion = this.onRemoveQuestion.bind(this);
    this.onEditQuestion = this.onEditQuestion.bind(this);
    this.onContentEdit = this.onContentEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.model !== this.props.model);
  }

  onAddQuestion() {
    const question = new contentTypes.Question();
    this.props.onEdit(this.props.model.with(
      { questions: this.props.model.questions.set(question.guid, question) }));
  }

  onRemoveQuestion(guid) {
    this.props.onEdit(this.props.model.with( 
      { questions: this.props.model.questions.delete(guid) }));
  }

  onEditQuestion(question: contentTypes.Question) {
    this.props.onEdit(this.props.model.with(
      { questions: this.props.model.questions.set(question.guid, question) }));
  }

  onContentEdit(content) {
    this.props.onEdit(this.props.model.with({ content }));
  }

  onTitleEdit(title) {
    this.props.onEdit(this.props.model.with({ title }));
  }


  renderQuestion(question: contentTypes.Question) {
    return <QuestionEditor
             {...this.props}
             model={question}
             onEdit={this.onEditQuestion}
           />;
  }

  render() : JSX.Element {
    
    return (
      <div className="componentWrapper pool">

        <div style={ { float: 'right' } }>
          <Button onClick={this.onAddQuestion}>Add Question</Button>
        </div>

        {this.props.model.questions.map(q => this.renderQuestion(q))};

      </div>
    );
  }

}

