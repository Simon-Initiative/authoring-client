import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Button } from '../common/controls';
import guid from 'utils/guid';
import {
    Question, QuestionProps, QuestionState,
} from './Question';

import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { ChoiceList, Choice, updateChoiceValuesAndRefs } from 'editors/content/common/Choice';

import './MultipleChoice.scss';

export interface MultipleChoiceProps
  extends QuestionProps<contentTypes.MultipleChoice> {

}

export interface MultipleChoiceState
  extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class MultipleChoice
  extends Question<MultipleChoiceProps, MultipleChoiceState> {

  constructor(props) {
    super(props);

    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onFeedbackEdit = this.onFeedbackEdit.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onReorderChoices = this.onReorderChoices.bind(this);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'multiple-choice';
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

  onChoiceEdit(choice: contentTypes.Choice) {
    const { partModel, itemModel, onEdit } = this.props;

    onEdit(
      itemModel.with({
        choices: itemModel.choices.set(choice.guid, choice),
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

  onRemoveChoice(choiceId: string, response: contentTypes.Response) {
    const { partModel, itemModel, onEdit } = this.props;

    const updatedItemModel = itemModel.with(
      { choices: itemModel.choices.delete(choiceId) });

    let updatePartModel = partModel;
    if (response) {
      updatePartModel = partModel.with(
        { responses: partModel.responses.delete(response.guid) });
    }

    onEdit(updatedItemModel, updatePartModel);
  }

  onReorderChoices(originalIndex: number, newIndex: number) {
    const { onEdit, itemModel, partModel } = this.props;

    // indexOffset makes up for the missing item in the list when splicing,
    // this is only an issue if the new item position is less than the current one
    const indexOffset = originalIndex > newIndex ? 1 : 0;

    // convert OrderedMap to shallow javascript array
    const choices = itemModel.choices.toArray();

    // remove selected choice from array and insert it into new position
    const choice = choices.splice(originalIndex, 1)[0];
    choices.splice((newIndex - 1) + indexOffset, 0, choice);

    // update item model
    const updatedItemModel = itemModel.with({
      // set choices to a new OrderedMap with updated choice ordering
      choices: choices.reduce(
        (acc, c) => {
          return acc.set(c.guid, c);
        },
        Immutable.OrderedMap<string, contentTypes.Choice>(),
      ),
    });

    // update models with new choices and references
    const newModels = updateChoiceValuesAndRefs(updatedItemModel, partModel);

    onEdit(
      newModels.itemModel,
      newModels.partModel,
    );
  }

  renderChoices() {
    const { context, services, editMode, partModel, itemModel } = this.props;

    const responses = partModel.responses.toArray();
    const choices = itemModel.choices.toArray();

    return choices.map((choice, i) => {
      const response = responses[i];
      return (
        <Choice
          key={choice.guid}
          index={i}
          choice={choice}
          allowFeedback
          allowScore
          response={response}
          allowReorder={!itemModel.shuffle}
          context={context}
          services={services}
          editMode={editMode}
          onReorderChoice={this.onReorderChoices}
          onEditChoice={this.onChoiceEdit}
          onEditFeedback={this.onFeedbackEdit}
          onEditScore={this.onScoreEdit}
          onRemove={choiceId => this.onRemoveChoice(choiceId, response)} />
      );
    });
  }

  renderDetails() {
    const { editMode, itemModel } = this.props;

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Choices">
            <TabOptionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
              <input
                className="toggle toggle-light"
                type="checkbox"
                readOnly
                checked={itemModel.shuffle} />
              <label className="toggle-btn"></label>
            </TabOptionControl>
          </TabSectionHeader>
          <TabSectionContent>
            <Button
              editMode={editMode}
              type="link"
              onClick={this.onAddChoice}>
              Add Choice
            </Button>
            <ChoiceList className="multiple-choice-choices">
              {this.renderChoices()}
            </ChoiceList>
          </TabSectionContent>
        </TabSection>
      </React.Fragment>
    );
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }
}
