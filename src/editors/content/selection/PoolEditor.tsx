import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor,
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { QuestionEditor } from '../question/QuestionEditor';
import { ContentEditor } from '../content/ContentEditor';

import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import { RemovableContent } from '../common/RemovableContent';
import guid from '../../../utils/guid';

import { DraggableNode } from 'editors/common/tree/DraggableNode';
import { RepositionTarget } from 'editors/common/tree/RepositionTarget';

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

    this.onReorderNode = this.onReorderNode.bind(this);
    this.canAcceptId = this.canAcceptId.bind(this);
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


  onReorderNode(id, index) {

    const oldQuestions = this.props.model.questions;
    const arr = this.props.model.questions.toArray();

    // find the index of the source node
    const sourceIndex = arr.findIndex(n => n.guid === id);

    if (sourceIndex !== -1) {

      let questions = Immutable.OrderedMap<string, contentTypes.Question>();
      const moved = oldQuestions.get(id);
      const indexToInsert = (sourceIndex < index) ? index - 1 : index;

      arr.forEach((n, i) => {

        if (i === index) {
          questions = questions.set(moved.guid, moved);
        }

        if (n.guid !== id) {
          questions = questions.set(n.guid, n);
        }
      });

      if (index === arr.length) {
        questions = questions.set(moved.guid, moved);
      }

      this.props.onEdit(this.props.model.with({ questions }));
    }

  }


  canAcceptId(id) {
    return this.props.model.questions.get(id) !== undefined;
  }

  renderQuestions() {
    const elements = [];
    const arr = this.props.model.questions.toArray();
    arr.forEach((node, index) => {
      // elements.push(<DraggableNode id={node.guid} editMode={this.props.editMode} index={index}>
      elements.push(this.renderQuestion(node));
    });

    return elements;
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
        {this.renderQuestions()}
      </div>
    );
  }

}

