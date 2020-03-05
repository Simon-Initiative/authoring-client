import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import guid from 'utils/guid';
import { ContentElements } from 'data/content/common/elements';
import { MultipleChoice } from 'editors/content/question/multiplechoice/MultipleChoice.controller';
import { Essay } from 'editors/content/question/essay/Essay.controller';
import { CheckAllThatApply } from
  'editors/content/question/checkallthatapply/CheckAllThatApply.controller';
import { ImageHotspot } from 'editors/content/question/imagehotspot/ImageHotspot.controller';
import { ShortAnswer } from 'editors/content/question/shortanswer/ShortAnswer.controller';
import { Ordering } from 'editors/content/question/ordering/Ordering.controller';
import { DynaDropInput } from 'editors/content/question/draganddrop/DynaDropInput.controller';
import { MultipartInput } from 'editors/content/question/multipart/MultipartInput.controller';
import { Skill } from 'types/course';
import { detectInputRefChanges } from 'data/content/assessment/question';
import { containsDynaDropCustom } from 'editors/content/utils/common';
import { Maybe } from 'tsmonad';

import './QuestionEditor.scss';
import { ContentElement } from 'data/content/common/interfaces';
import { InputRefType } from 'data/content/learning/input_ref';

export interface Props extends AbstractContentEditorProps<contentTypes.Question> {
  onRemove: (guid: string) => void;
  onDuplicate?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  isParentAssessmentGraded?: boolean;
  isQuestionPool: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
  canRemove: boolean;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
  branchingQuestions: Maybe<number[]>;
}

export interface State {
  activeItemId: string;
}

/**
 * Question Editor Component
 */
export class QuestionEditor
  extends AbstractContentEditor<contentTypes.Question, Props, State> {
  lastBody: ContentElements = this.props.model.body;

  state = {
    ...this.state,
    activeItemId: null,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return nextProps.activeContentGuid !== this.props.activeContentGuid ||
      nextProps.model !== this.props.model ||
      nextProps.context !== this.props.context ||
      nextProps.allSkills !== this.props.allSkills ||
      nextProps.hover !== this.props.hover ||
      nextProps.activeContentGuid !== this.props.activeContentGuid ||
      nextState.activeItemId !== this.state.activeItemId;
  }

  createFillInTheBlank() {
    const choice = contentTypes.Choice.fromText('', guid()).with({
      value: guid().replace('-', ''),
    });

    return new contentTypes.FillInTheBlank().with({
      choices: Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice),
    });
  }

  /** Override Parent Method */
  handleOnClick(e) {
    if (this.props.onHandleClick !== undefined) {
      this.props.onHandleClick(e);
    }
  }

  onBlur = (activeItemId: string) => {
    if (this.state.activeItemId === activeItemId) {
      this.setState({ activeItemId: null });
    }
  }

  onFocusChange = (activeItemId: string) => {
    this.setState({ activeItemId });
  }

  canInsertAnotherPart = (
    question: contentTypes.Question,
    contentTypeToAdd: 'Numeric' | 'Text' | 'FillInTheBlank'): boolean => {

    if (!this.props.isParentAssessmentGraded) {
      return true;
    }

    // For summative, require that all the items be of the type type
    return question.items.size === 0
      || question.items.first().contentType === contentTypeToAdd;
  }

  onBodyEdit = (body: ContentElements, src: ContentElement) => {
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

            if (currentItem.id !== undefined && currentItem.id === d.input) {
              items = items.delete(currentItem.guid);
              parts = parts.delete(partsArray[i].guid);
              break;
            }
          }
        });
        question = question.with({ items, parts });

      } else if (delta.additions.size > 0) {

        const inputRef = delta.additions.toArray()[0];

        let newItem = null;
        let newPart = null;

        if (inputRef.inputType === InputRefType.FillInTheBlank) {
          const item = new contentTypes.FillInTheBlank().with({ id: inputRef.input });
          const part = new contentTypes.Part();

          // values are formatted like guids without dashes in the DTD
          const value = guid().replace('-', '');
          const choice = contentTypes.Choice.fromText('', guid()).with({ value });
          const feedback = contentTypes.Feedback.fromText('', guid());
          let response = new contentTypes.Response().with({ match: value, input: inputRef.input });
          response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });

          newItem = item.with({ choices: item.choices.set(choice.guid, choice) });
          newPart = part.with({ responses: part.responses.set(response.guid, response) });

        } else if (inputRef.inputType === InputRefType.Text) {

          newItem = new contentTypes.Text().with({ id: inputRef.input });
          newPart = this.buildPartWithInitialResponse('answer', inputRef.input);

        } else {

          newItem = new contentTypes.Numeric().with({ id: inputRef.input });
          newPart = this.buildPartWithInitialResponse('0', inputRef.input);
        }

        question = question.with({
          items: question.items.set(newItem.guid, newItem),
          parts: question.parts.set(newPart.guid, newPart),
        });

      }
    }

    this.lastBody = body;

    this.props.onEdit(question, src);
  }


  buildPartWithInitialResponse(match: string, input): contentTypes.Part {

    const correctFeedback = contentTypes.Feedback.fromText('Correct!', guid());
    const correctResponse = new contentTypes.Response().with({
      feedback: Immutable.OrderedMap<string, contentTypes.Feedback>()
        .set(correctFeedback.guid, correctFeedback),
      score: Maybe.just('1'),
      input,
      match,
    });

    const otherFeedback = contentTypes.Feedback.fromText('Incorrect.', guid());
    const otherResponse = new contentTypes.Response().with({
      feedback: Immutable.OrderedMap<string, contentTypes.Feedback>()
        .set(otherFeedback.guid, otherFeedback),
      score: Maybe.just('0'),
      input,
      match: '*',
    });

    return new contentTypes.Part().with({
      responses: Immutable.OrderedMap<string, contentTypes.Response>()
        .set(correctResponse.guid, correctResponse)
        .set(otherResponse.guid, otherResponse),
    });

  }

  onItemPartEdit = (
    item: contentTypes.QuestionItem, part: contentTypes.Part, src: ContentElement) => {
    const { model, onEdit } = this.props;
    onEdit(
      model.with({
        parts: model.parts.set(part.guid, part),
        items: model.items.set(item.guid, item),
      }),
      src);
  }

  onRemove = (itemModel: contentTypes.QuestionItem, partModel) => {
    let { model } = this.props;
    const { onEdit } = this.props;

    switch (itemModel.contentType) {
      case 'Numeric':
      case 'Text':
      case 'FillInTheBlank':
        model = model.removeInputRef(itemModel.id);
    }

    onEdit(model.with({
      items: model.items.delete(itemModel.guid),
      parts: model.parts.delete(partModel.guid),
    }));
  }

  onGradingChange = (grading) => {
    this.props.onEdit(this.props.model.with({ grading }));
  }

  onVariablesChange = (variables: Immutable.OrderedMap<string, contentTypes.Variable>) => {
    this.props.onEdit(this.props.model.with({ variables }));
  }

  handleOnFocus() {
    // Do nothing for questions
  }

  onAddItemPart = (
    item: contentTypes.QuestionItem, part: contentTypes.Part, body: ContentElements) => {
    const { model, onEdit } = this.props;

    this.lastBody = body;

    onEdit(
      model.with({
        body,
        items: this.props.model.items.set(item.guid, item),
        parts: this.props.model.parts.set(part.guid, part),
      }),
      null);
  }

  renderQuestionBody(): JSX.Element {
    const { canRemove, model, onDuplicate, onCopy, onPaste,
      isParentAssessmentGraded, isQuestionPool, onRemove } = this.props;

    const item = model.items.first();
    const part = model.parts.first();

    const isMultipart = (model.items.size === 0)
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
      body: model.body,
      grading: model.grading,
      onGradingChange: this.onGradingChange,
      onVariablesChange: this.onVariablesChange,
      onDuplicate,
      onCopy,
      onPaste,
      onBodyEdit: this.onBodyEdit,
      hideGradingCriteria: !isParentAssessmentGraded,
      hideVariables: !isQuestionPool,
      canRemoveQuestion: canRemove,
      onRemoveQuestion: onRemove.bind(this, model.guid),
      onEdit: (c, p, src) => this.onItemPartEdit(c, p, src),
    };

    if (isMultipart) {
      if (containsDynaDropCustom(model.body)) {
        return (
          <DynaDropInput
            {...questionProps}
            itemModel={item}
            onAddItemPart={this.onAddItemPart} />
        );
      }

      return (
        <MultipartInput
          {...questionProps}
          itemModel={item}
          canInsertAnotherPart={part => this.canInsertAnotherPart(model, part)}
        />
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
