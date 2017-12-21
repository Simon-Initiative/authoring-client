import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { MultipleChoice } from './MultipleChoice';
import { Essay } from './Essay';
import { CheckAllThatApply } from './CheckAllThatApply.controller';
import { ShortAnswer } from './ShortAnswer';
import { Ordering } from './Ordering';
import { MultipartInput } from './MultipartInput';
import { EntityTypes } from '../../../data/content/html/common';
import { Skill } from 'types/course';
import { changes, removeInputRef } from '../../../data/content/html/changes';
import { InsertInputRefCommand } from './commands';

import './QuestionEditor.scss';

export interface QuestionEditorProps extends AbstractContentEditorProps<contentTypes.Question> {
  onRemove: (guid: string) => void;
  isParentAssessmentGraded?: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
}

export interface QuestionEditorState {
  activeItemId: string;
}

/**
 * The content editor for HtmlContent.
 */
export class QuestionEditor
  extends AbstractContentEditor<contentTypes.Question, QuestionEditorProps, QuestionEditorState> {
  lastBody: contentTypes.Html;
  itemToAdd: any;
  fillInTheBlankCommand: InsertInputRefCommand;
  numericCommand: InsertInputRefCommand;
  textCommand: InsertInputRefCommand;

  constructor(props) {
    super(props);

    this.state = {
      activeItemId: null,
    };

    const createFillInTheBlank = () => {
      const value = guid().replace('-', '');
      const choice = new contentTypes.Choice().with({ value, guid: guid() });

      const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);

      return new contentTypes.FillInTheBlank().with({ choices });
    };

    this.onBlur = this.onBlur.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.canInsertAnotherPart = this.canInsertAnotherPart.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onItemPartEdit = this.onItemPartEdit.bind(this);
    this.onAddMultipleChoice = this.onAddMultipleChoice.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onGradingChange = this.onGradingChange.bind(this);
    this.onAddShortAnswer = this.onAddShortAnswer.bind(this);
    this.onAddOrdering = this.onAddOrdering.bind(this);

    this.fillInTheBlankCommand
      = new InsertInputRefCommand(this, createFillInTheBlank, 'FillInTheBlank');
    this.numericCommand
      = new InsertInputRefCommand(this, () => new contentTypes.Numeric(), 'Numeric');
    this.textCommand
      = new InsertInputRefCommand(this, () => new contentTypes.Text(), 'Text');

    this.lastBody = this.props.model.body;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const should = this.props.model !== nextProps.model
      || this.props.allSkills !== nextProps.allSkills
      || this.state.activeItemId !== nextState.activeItemId;

    return should;
  }

  onBlur(activeItemId: string) {
    if (this.state.activeItemId === activeItemId) {
      this.setState({ activeItemId: null });
    }
  }

  onFocusChange(activeItemId: string) {
    this.setState({ activeItemId });
  }

  canInsertAnotherPart(): boolean {
    const restricted = this.props.isParentAssessmentGraded
      === undefined || this.props.isParentAssessmentGraded;

    return !restricted || this.props.model.items.size === 0;
  }

  onBodyEdit(body) {

    let question = this.props.model.with({ body });

    if (this.lastBody !== undefined) {
      const delta
        = changes(EntityTypes.input_ref, '@input', this.lastBody.contentState, body.contentState);

      // For any deletions of input_refs, we need to make sure that we remove
      // the corresponding item and part from the question model
      if (delta.deletions.size > 0) {
        let items = this.props.model.items;
        let parts = this.props.model.parts;
        const itemArray = items.toArray();
        const partsArray = parts.toArray();
        delta.deletions.toArray().forEach((d) => {


          // Find the item whose id matches this entity @input data field
          // and remove it and the corresponding part
          for (let i = 0; i < itemArray.length; i += 1) {
            const currentItem = (itemArray[i] as any);

            if (currentItem.id !== undefined && currentItem.id === d.entity.data['@input']) {
              items = items.delete(currentItem.guid);
              parts = parts.delete(partsArray[i].guid);
              break;
            }
          }

        });
        question = question.with({ items, parts });

      } else if (delta.additions.size > 0) {

        const input = delta.additions.toArray()[0].entity.data['@input'];

        const item = this.itemToAdd.with({ guid: input, id: input });

        question = question.with({ items: question.items.set(item.guid, item) });

        let responses = Immutable.OrderedMap<string, contentTypes.Response>();
        if (item.contentType === 'FillInTheBlank') {

          const feedback = new contentTypes.Feedback();
          let response = new contentTypes.Response({ match: item.choices.first().value });

          response = response.with({ guid: guid(),
            feedback: response.feedback.set(feedback.guid, feedback) });
          responses = responses
            .set(response.guid, response);
        }

        let part = new contentTypes.Part();
        part = part.with({ guid: guid(), responses });
        question = question.with({ parts: question.parts.set(part.guid, part) });

      }
    }

    this.lastBody = body;



    this.props.onEdit(question);
  }

  onItemPartEdit(item, part) {
    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });
    model = model.with({ parts: model.parts.set(part.guid, part) });
    this.props.onEdit(model);
  }


  onAddMultipleChoice(select) {

    if (!this.canInsertAnotherPart()) return;

    let item = new contentTypes.MultipleChoice();

    const value = select === 'multiple' ? 'A' : guid().replace('-', '');
    const match = select === 'multiple' ? 'A' : value;

    const choice = new contentTypes.Choice({ value, guid: guid() });
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response({ match });
    response = response.with({ guid: guid(),
      feedback: response.feedback.set(feedback.guid, feedback) });

    const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);
    const responses = Immutable.OrderedMap<string, contentTypes.Response>()
      .set(response.guid, response);

    item = item.with({ guid: guid(), select, choices });

    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    part = part.with({ guid: guid(), responses });
    model = model.with({ parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  onRemove(itemModel: contentTypes.QuestionItem, partModel) {

    const items = this.props.model.items.delete(itemModel.guid);
    const parts = this.props.model.parts.delete(partModel.guid);
    let body = this.props.model.body;

    switch (itemModel.contentType) {
      case 'Numeric':
      case 'Text':
      case 'FillInTheBlank':
        body = removeInputRef(body, itemModel.id);
    }

    const model = this.props.model.with({ items, parts, body });
    this.props.onEdit(model);
  }

  onGradingChange(grading) {

    this.props.onEdit(this.props.model.with({ grading }));
  }

  onAddShortAnswer(e) {
    e.preventDefault();

    if (!this.canInsertAnotherPart()) return;


    const item = new contentTypes.ShortAnswer();
    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    const response = new contentTypes.Response({ match: '*', score: '1' });

    part = part.with({ responses: part.responses.set(response.guid, response) });
    model = model.with({ parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  onAddOrdering(e) {
    e.preventDefault();
    if (!this.canInsertAnotherPart()) return;

    const value = 'A';

    const choice = new contentTypes.Choice().with({ value, guid: guid() });
    const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);
    const item = new contentTypes.Ordering().with({ choices });
    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });

    const part = new contentTypes.Part();
    model = model.with({ parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  renderQuestionBody(): JSX.Element {
    const item = this.props.model.items.first();
    const part = this.props.model.parts.first();

    const isMultipart = (this.props.model.items.size === 0)
      || item.contentType === 'Text'
      || item.contentType === 'Numeric'
      || item.contentType === 'FillInTheBlank';

    if (isMultipart) {
      const key = item ? item.guid : Math.random() + '';
      return (
        <MultipartInput
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          allSkills={this.props.allSkills}
          key={key}
          itemModel={item}
          partModel={part}
          body={this.props.model.body}
          grading={this.props.model.grading}
          onGradingChange={this.onGradingChange}
          onBodyEdit={this.onBodyEdit}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          fillInTheBlankCommand={this.fillInTheBlankCommand}
          numericCommand={this.numericCommand}
          textCommand={this.textCommand}
          canInsertAnotherPart={() => this.canInsertAnotherPart()}
          model={this.props.model}
          onRemoveQuestion={this.props.onRemove.bind(this, this.props.model.guid)}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} />
      );
    }
    if (item.contentType === 'MultipleChoice' && item.select === 'single') {
      return (
        <MultipleChoice
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          allSkills={this.props.allSkills}
          key={item.guid}
          itemModel={item}
          partModel={part}
          body={this.props.model.body}
          grading={this.props.model.grading}
          onGradingChange={this.onGradingChange}
          onBodyEdit={this.onBodyEdit}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          model={this.props.model}
          onRemoveQuestion={this.props.onRemove.bind(this, this.props.model.guid)}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} />
      );
    }
    if (item.contentType === 'MultipleChoice' && item.select === 'multiple') {
      return (
        <CheckAllThatApply
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          allSkills={this.props.allSkills}
          key={item.guid}
          itemModel={item}
          partModel={part}
          body={this.props.model.body}
          grading={this.props.model.grading}
          onGradingChange={this.onGradingChange}
          onBodyEdit={this.onBodyEdit}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          model={this.props.model}
          onRemoveQuestion={this.props.onRemove.bind(this, this.props.model.guid)}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} />
      );
    }
    if (item.contentType === 'ShortAnswer') {
      return (
        <ShortAnswer
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          allSkills={this.props.allSkills}
          key={item.guid}
          itemModel={item}
          partModel={part}
          body={this.props.model.body}
          grading={this.props.model.grading}
          onGradingChange={this.onGradingChange}
          onBodyEdit={this.onBodyEdit}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          model={this.props.model}
          onRemoveQuestion={this.props.onRemove.bind(this, this.props.model.guid)}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} />
      );
    }
    if (item.contentType === 'Ordering') {
      return (
        <Ordering
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          allSkills={this.props.allSkills}
          key={item.guid}
          itemModel={item}
          partModel={part}
          body={this.props.model.body}
          grading={this.props.model.grading}
          onGradingChange={this.onGradingChange}
          onBodyEdit={this.onBodyEdit}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          model={this.props.model}
          onRemoveQuestion={this.props.onRemove.bind(this, this.props.model.guid)}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} />
      );
    }
    if (item.contentType === 'Essay') {
      return (
        <Essay
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          allSkills={this.props.allSkills}
          key={item.guid}
          itemModel={item}
          partModel={part}
          body={this.props.model.body}
          grading={this.props.model.grading}
          onGradingChange={this.onGradingChange}
          onBodyEdit={this.onBodyEdit}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          model={this.props.model}
          onRemoveQuestion={this.props.onRemove.bind(this, this.props.model.guid)}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} />
      );
    }
  }

  render() {
    return (
      <div className="question-editor">
        {this.renderQuestionBody()}
      </div>
    );
  }
}
