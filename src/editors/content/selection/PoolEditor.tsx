import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { QuestionEditor } from 'editors/content/question/question/QuestionEditor';
import { Skill } from 'types/course';
import { Maybe } from 'tsmonad';

export interface PoolProps extends AbstractContentEditorProps<contentTypes.Pool> {
  onRemove: (guid: string) => void;
  isParentAssessmentGraded?: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
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
      isQuestionPool={false}
      model={question}
      onEdit={this.onEditQuestion}
      canRemove={true}
      onRemove={this.onRemoveQuestion}
      branchingQuestions={Maybe.nothing()}
    />;
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain(): JSX.Element {

    return (
      <div>
        {this.renderQuestions()}
      </div>
    );
  }

}
