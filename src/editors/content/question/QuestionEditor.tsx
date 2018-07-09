import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { ContentElements } from 'data/content/common/elements';
import { MultipleChoice } from './MultipleChoice.controller';
import { Essay } from './Essay';
import { CheckAllThatApply } from './CheckAllThatApply.controller';
import { ImageHotspot } from './ImageHotspot.controller';
import { ShortAnswer } from './ShortAnswer';
import { Ordering } from './Ordering.controller';
import { DynaDropInput } from './DynaDropInput.controller';
import { MultipartInput } from './MultipartInput.controller';
import { Skill } from 'types/course';
import { InsertInputRefCommand } from './commands';
import { detectInputRefChanges } from 'data/content/assessment/question';

import './QuestionEditor.scss';

export const containsDynaDropCustom = (modelBody: ContentElements) => modelBody.content.reduce(
  (acc, val) => {
    return acc || val.contentType === 'Custom'
      && val.src.substr(val.src.length - 11) === 'DynaDrop.js';
  },
  false,
);

export interface QuestionEditorProps extends AbstractContentEditorProps<contentTypes.Question> {
  onRemove: (guid: string) => void;
  onDuplicate?: () => void;
  isParentAssessmentGraded?: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
  canRemove: boolean;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
}

export interface QuestionEditorState {
  activeItemId: string;
}

/**
 * Question Editor Component
 */
export class QuestionEditor
  extends AbstractContentEditor<contentTypes.Question, QuestionEditorProps, QuestionEditorState> {
  lastBody: ContentElements;
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
      const choice = contentTypes.Choice.fromText('', guid()).with({ value });

      const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);

      return new contentTypes.FillInTheBlank().with({ choices });
    };

    this.onBlur = this.onBlur.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.canInsertAnotherPart = this.canInsertAnotherPart.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onItemPartEdit = this.onItemPartEdit.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onGradingChange = this.onGradingChange.bind(this);
    this.onVariablesChange = this.onVariablesChange.bind(this);
    this.onAddItemPart = this.onAddItemPart.bind(this);

    this.fillInTheBlankCommand
      = new InsertInputRefCommand(this, createFillInTheBlank, 'FillInTheBlank');
    this.numericCommand
      = new InsertInputRefCommand(this, () => new contentTypes.Numeric(), 'Numeric');
    this.textCommand
      = new InsertInputRefCommand(this, () => new contentTypes.Text(), 'Text');

    this.lastBody = this.props.model.body;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.activeContentGuid !== this.props.activeContentGuid) {
      return true;
    }
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }

    if (nextProps.allSkills !== this.props.allSkills) {
      return true;
    }

    if (nextProps.activeItemId !== this.state.activeItemId) {
      return true;
    }

    if (nextProps.hover !== this.props.hover) {
      return true;
    }

    if (nextProps.activeContentGuid !== this.props.activeContentGuid) {
      return true;
    }

    return false;
  }


  /** Override Parent Method */
  handleOnClick(e) {
    if (this.props.onHandleClick !== undefined) {
      this.props.onHandleClick(e);
    }
  }

  onBlur(activeItemId: string) {
    if (this.state.activeItemId === activeItemId) {
      this.setState({ activeItemId: null });
    }
  }

  onFocusChange(activeItemId: string) {
    this.setState({ activeItemId });
  }

  canInsertAnotherPart(
    question: contentTypes.Question,
    contentTypeToAdd: 'Numeric' | 'Text' | 'FillInTheBlank'): boolean {

    if (!this.props.isParentAssessmentGraded) {
      return true;
    }

    // For summative, require that all the items be of the type type
    return question.items.size === 0
      || question.items.first().contentType === contentTypeToAdd;
  }

  onBodyEdit(body: ContentElements, src) {

    let question = this.props.model.with({ body });

    if (this.lastBody !== undefined) {
      const delta = detectInputRefChanges(body, this.lastBody);

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

          const feedback = contentTypes.Feedback.fromText('', guid());
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



    this.props.onEdit(question, src);
  }

  onItemPartEdit(item, part, src) {
    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });
    model = model.with({ parts: model.parts.set(part.guid, part) });
    this.props.onEdit(model, src);
  }

  onRemove(itemModel: contentTypes.QuestionItem, partModel) {

    const items = this.props.model.items.delete(itemModel.guid);
    const parts = this.props.model.parts.delete(partModel.guid);
    let model = this.props.model;

    switch (itemModel.contentType) {
      case 'Numeric':
      case 'Text':
      case 'FillInTheBlank':
        model = model.removeInputRef(itemModel.id);
    }

    model = model.with({ items, parts });
    this.props.onEdit(model);
  }

  onGradingChange(grading) {

    this.props.onEdit(this.props.model.with({ grading }));
  }

  onVariablesChange(variables: Immutable.OrderedMap<string, contentTypes.Variable>) {

    this.props.onEdit(this.props.model.with({ variables }));
  }

  handleOnFocus() {
    // Do nothing for questions
  }

  onAddItemPart(item, part, body) {

    const model = this.props.model.with({
      body,
      items: this.props.model.items.set(item.guid, item),
      parts: this.props.model.parts.set(part.guid, part),
    });

    this.lastBody = body;

    this.props.onEdit(model, null);
  }

  renderQuestionBody(): JSX.Element {
    const { canRemove } = this.props;

    const item = this.props.model.items.first();
    const part = this.props.model.parts.first();

    const isMultipart = (this.props.model.items.size === 0)
      || item.contentType === 'Text'
      || item.contentType === 'Numeric'
      || item.contentType === 'FillInTheBlank';

    const questionProps = {
      ...this.props,
      onItemFocus: this.onFocusChange,
      onRemove: this.onRemove,
      onBlur: this.onBlur,
      itemModel: item,
      partModel: part,
      body: this.props.model.body,
      grading: this.props.model.grading,
      onGradingChange: this.onGradingChange,
      onVariablesChange: this.onVariablesChange,
      onDuplicate: this.props.onDuplicate,
      onBodyEdit: this.onBodyEdit,
      hideGradingCriteria: !this.props.isParentAssessmentGraded,
      hideVariables: !this.props.isParentAssessmentGraded,
      canRemoveQuestion: canRemove,
      onRemoveQuestion: this.props.onRemove.bind(this, this.props.model.guid),
      onEdit: (c, p, src) => this.onItemPartEdit(c, p, src),
    };

    if (isMultipart) {
      if (containsDynaDropCustom(this.props.model.body)) {
        return (
        <DynaDropInput
          {...questionProps} itemModel={item}
          onAddItemPart={this.onAddItemPart} />
        );
      }

      return (
        <MultipartInput
          {...questionProps} itemModel={item}
          canInsertAnotherPart={part => this.canInsertAnotherPart(this.props.model, part)}
          onAddItemPart={this.onAddItemPart}/>
      );
    }
    if (item.contentType === 'MultipleChoice' && item.select === 'single') {
      return (
        <MultipleChoice {...questionProps} itemModel={item} />
      );
    }
    if (item.contentType === 'MultipleChoice' && item.select === 'multiple') {
      return (
        <CheckAllThatApply {...questionProps} itemModel={item} />
      );
    }
    if (item.contentType === 'ShortAnswer') {
      return (
        <ShortAnswer {...questionProps} itemModel={item} />
      );
    }
    if (item.contentType === 'Ordering') {
      return (
        <Ordering {...questionProps} itemModel={item} />
      );
    }
    if (item.contentType === 'Essay') {
      return (
        <Essay {...questionProps} itemModel={item} />
      );
    }
    if (item.contentType === 'ImageHotspot') {
      return (
        <ImageHotspot {...questionProps} itemModel={item} />
      );
    }
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() {
    return (
      <div className="question-editor">
        {this.renderQuestionBody()}
      </div>
    );
  }
}
