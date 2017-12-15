import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { Choice } from '../common/Choice';
import { FeedbackEditor } from '../part/FeedbackEditor';
import { TextInput, InlineForm, Button } from '../common/controls';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import guid from 'utils/guid';
import { Question, QuestionProps, QuestionState,
 Section, SectionContent, SectionControl, SectionHeader } from './Question';
import {
  InputList, InputListItem, ItemOptions, ItemOption, ItemControl, ItemOptionFlex,
} from 'editors/content/common/InputList.tsx';

import './MultipleChoice.scss';

export interface MultipleChoiceProps
  extends QuestionProps<contentTypes.MultipleChoice> {

}

export interface MultipleChoiceState
  extends QuestionState {

}

const HTML_CONTENT_EDITOR_STYLE = {
  minHeight: '20px',
  borderStyle: 'none',
  borderWith: 1,
  borderColor: '#AAAAAA',
};

// tslint:disable-next-line
const ChoiceFeedback = (props) => {
  return (
    <div className="choice-feedback clearfix">
      {props.children}
    </div>
  );
};

/**
 * The content editor for HtmlContent.
 */
export class MultipleChoice
  extends Question<MultipleChoiceProps, MultipleChoiceState> {

  constructor(props) {
    super(props);

    this.setClassname('multiple-choice');

    this.onAddChoice = this.onAddChoice.bind(this);
    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
  }

  onToggleShuffle() {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ shuffle: !itemModel.shuffle }), partModel);
  }

  onAddChoice() {
    const { partModel, itemModel, onEdit } = this.props;

    const value = guid().replace('-', '');
    const match = value;
    const choice = new contentTypes.Choice({ value });
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response({ match });
    response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });

    const updatedItemModel = itemModel.with(
      { choices: itemModel.choices.set(choice.guid, choice) });
    const updatedPartModel = partModel.with(
      { responses: partModel.responses.set(response.guid, response) });

    onEdit(updatedItemModel, updatedPartModel);
  }

  onChoiceEdit(c) {
    const { partModel, itemModel, onEdit } = this.props;

    onEdit(
      itemModel.with({
        choices: itemModel.choices.set(c.guid, c),
      }),
      partModel);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback) {
    const { partModel, itemModel, onEdit } = this.props;

    const updated = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    const part = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) });
    onEdit(itemModel, part);
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const { partModel, itemModel, onEdit } = this.props;

    const updatedScore = response.with({ score });
    const updatedPartModel = partModel.with(
      { responses: partModel.responses.set(updatedScore.guid, updatedScore) },
    );

    onEdit(itemModel, updatedPartModel);
  }

  onRemoveChoice(choice, response) {
    const { partModel, itemModel, onEdit } = this.props;

    const updatedItemModel = itemModel.with(
      { choices: itemModel.choices.delete(choice.guid) });

    let updatePartModel = partModel;
    if (response) {
      updatePartModel = partModel.with(
        { responses: partModel.responses.delete(response.guid) });
    }

    onEdit(updatedItemModel, updatePartModel);
  }

  renderChoices() {
    const { context, services, editMode, partModel, itemModel } = this.props;

    const responses = partModel.responses.toArray();
    const choices = itemModel.choices.toArray();

    const renderedChoices = choices.map((choice, i) => {
      const response = responses[i];

      let feedbackEditor;
      let scoreEditor;
      if (response && response.feedback.size > 0) {
        const feedback = response.feedback.first();

        feedbackEditor = (
          <HtmlContentEditor
            editorStyles={HTML_CONTENT_EDITOR_STYLE}
            inlineToolbar={<InlineToolbar/>}
            blockToolbar={<BlockToolbar/>}
            inlineInsertionToolbar={<InlineInsertionToolbar/>}
            {...this.props}
            model={feedback.body}
            onEdit={body => this.onFeedbackEdit(response, feedback.with({ body }))} />
        );

        scoreEditor = (
          <div className="input-group">
            <input
              type="number"
              className="form-control input-sm form-control-sm"
              disabled={!editMode}
              value={response.score}
              onChange={({ target: { value } }) =>
                this.onScoreEdit(response, value)
              } />
          </div>
        );
      }

      return (
        <InputListItem
          key={choice.guid}
          className="choice"
          id={choice.guid}
          label={`${i + 1}`}
          context={context}
          services={services}
          editMode={editMode}
          body={choice.body}
          onEdit={body => this.onChoiceEdit(choice.with({ body }))}
          onRemove={() => this.onRemoveChoice.bind(this, choice, response)}>
          <ItemOptions>
            <ItemOption className="feedback" label="Feedback" flex={true}>
              {feedbackEditor}
            </ItemOption>
            <ItemOption className="score" label="Score">
              {scoreEditor}
            </ItemOption>
          </ItemOptions>
        </InputListItem>
      );
    });

    return (
      <InputList className="multiple-choice-choices">
        {renderedChoices}
      </InputList>
    );
  }

  renderAdditionalSections() {
    const { editMode, itemModel, partModel } = this.props;

    return ([
      <Section key="choices" className="choices">
        <SectionHeader title="Choices">
          <SectionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
            <input
              className="toggle toggle-light"
              type="checkbox"
              checked={itemModel.shuffle} />
            <label className="toggle-btn"></label>
          </SectionControl>
        </SectionHeader>
        <SectionContent>
          <Button
            editMode={editMode}
            type="link"
            onClick={this.onAddChoice}>
            Add Choice
          </Button>
          {this.renderChoices()}
        </SectionContent>
      </Section>,
    ]);
  }
}
