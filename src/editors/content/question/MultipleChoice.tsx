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
import { ToggleSwitch } from 'components/common/ToggleSwitch';

import './MultipleChoice.scss';

export const isComplexScoring = (partModel: contentTypes.Part) => {
  const responses = partModel.responses.filter(r => !r.name.match(/^AUTOGEN/)).toArray();

  // scoring is complex (advanced mode) if scores exist for multiple
  // responses OR score is not 0 or 1
  let prevEncounteredScore = false;
  const isAdvancedScoringMode = responses.reduce(
    (acc, val, i) => {
      const score = +val.score;
      if (prevEncounteredScore && score !== 0) {
        return true;
      }
      if (score !== 0) {
        prevEncounteredScore = true;
      }

      return acc || (score !== 0 && score !== 1);
    },
    false,
  );

  return isAdvancedScoringMode;
};

export const resetAllScores = (partModel: contentTypes.Part) => {
  const responses = partModel.responses.toArray();

  const updatedResponses = responses.reduce(
    (acc, r) => acc.set(r.guid, r.with({ score: '0' })),
    partModel.responses,
  );

  const updatedPartModel = partModel.with({
    responses: updatedResponses,
  });

  return updatedPartModel;
};

export interface MultipleChoiceProps
    extends QuestionProps<contentTypes.MultipleChoice> {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

export interface MultipleChoiceState
    extends QuestionState {

}

/**
 * The content editor for Multiple Choice Question
 */
export class MultipleChoice
   extends Question<MultipleChoiceProps, MultipleChoiceState> {

  constructor(props) {
    super(props);

    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
    this.onToggleSimpleSelect = this.onToggleSimpleSelect.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onFeedbackEdit = this.onFeedbackEdit.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onReorderChoices = this.onReorderChoices.bind(this);
  }

  componentDidMount() {
    const {
      partModel, model, advancedScoringInitialized, onToggleAdvancedScoring,
    } = this.props;

    // initialize advanced scoring if its not already
    if (!advancedScoringInitialized) {
      onToggleAdvancedScoring(model.guid, isComplexScoring(partModel));
    }
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

    const updated = itemModel.with({ shuffle: !itemModel.shuffle });

    onEdit(updated, partModel, updated);
  }

  onToggleAdvanced() {
    const {
      itemModel, partModel, model, onToggleAdvancedScoring, advancedScoring, onEdit,
    } = this.props;

    // if switching from advanced mode and scoring is complex, reset all scores
    // so they are valid in simple mode. Otherwise, we can leave the scores as-is
    if (advancedScoring && isComplexScoring(partModel)) {
      const updatedPartModel = resetAllScores(partModel);
      onEdit(itemModel, updatedPartModel, updatedPartModel);
    }

    onToggleAdvancedScoring(model.guid);
  }

  onToggleSimpleSelect(response: contentTypes.Response, choice: contentTypes.Choice) {
    const { itemModel, partModel, onEdit } = this.props;

    let updatedPartModel = resetAllScores(partModel);

    updatedPartModel = updatedPartModel.with({
      responses: updatedPartModel.responses.set(
        response.guid, response.with({ score: response.score === '0' ? '1' : '0' }),
      ),
    });

    onEdit(itemModel, updatedPartModel, updatedPartModel);
  }

  onAddChoice() {
    const { partModel, itemModel, onEdit } = this.props;

    const value = guid().replace('-', '');
    const match = value;
    const choice = contentTypes.Choice.fromText('', guid()).with({ value });
    const feedback = contentTypes.Feedback.fromText('', guid());
    let response = new contentTypes.Response({ match });
    response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });

    const updatedItemModel = itemModel.with(
      { choices: itemModel.choices.set(choice.guid, choice) });
    const updatedPartModel = partModel.with(
      { responses: partModel.responses.set(response.guid, response) });

    onEdit(updatedItemModel, updatedPartModel, null);
  }

  onChoiceEdit(choice: contentTypes.Choice, src) {
    const { partModel, itemModel, onEdit } = this.props;

    const updated = itemModel.with({
      choices: itemModel.choices.set(choice.guid, choice),
    });
    onEdit(
      updated,
      partModel,
      src);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback, src) {
    const { partModel, itemModel, onEdit } = this.props;

    const updated = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    const part = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) });
    onEdit(itemModel, part, src);
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const { partModel, itemModel, onEdit } = this.props;

    const updatedScore = response.with({ score });
    const updatedPartModel = partModel.with(
      { responses: partModel.responses.set(updatedScore.guid, updatedScore) },
    );

    onEdit(itemModel, updatedPartModel, updatedPartModel);
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

    onEdit(updatedItemModel, updatePartModel, updatedItemModel);
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
      newModels.itemModel,
    );
  }

  renderChoices() {
    const { context, services, editMode, partModel, itemModel, advancedScoring } = this.props;

    const responsesByMatch = partModel.responses
      .toArray()
      .reduce(
        (o, response) => {
          o[response.match] = response;
          return o;
        },
        {},
      );

    const choices = itemModel.choices.toArray();

    return choices.map((choice, i) => {

      const response = responsesByMatch[choice.value];

      if (response !== undefined) {
        return (
          <Choice
            activeContentGuid={this.props.activeContentGuid}
            hover={this.props.hover}
            onUpdateHover={this.props.onUpdateHover}
            onFocus={this.props.onFocus}
            key={choice.guid}
            index={i}
            choice={choice}
            allowFeedback
            allowScore={advancedScoring}
            simpleSelectProps={{
              selected: response.score !== '0',
              onToggleSimpleSelect: this.onToggleSimpleSelect,
            }}
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
      }

      // If we cannot locate a response, this must be bad data.  Just display an error.
      return (
        <div className="alert alert-danger" role="alert">
          Could not match choice and response. Please check the original XML.
        </div>
      );
    });
  }

  renderDetails() {
    const { editMode, itemModel, advancedScoring } = this.props;

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Choices">
            <TabOptionControl key="add-choice" name="Add Choice" hideLabel>
              <Button
                editMode={editMode}
                type="link"
                onClick={this.onAddChoice}>
                Add Choice
              </Button>
            </TabOptionControl>
            <TabOptionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
              <ToggleSwitch checked={itemModel.shuffle} />
            </TabOptionControl>
            <TabOptionControl key="advancedscoring" name="Advanced" onClick={this.onToggleAdvanced}>
              <ToggleSwitch checked={advancedScoring} />
            </TabOptionControl>
          </TabSectionHeader>
          <TabSectionContent>
            <div className="instruction-label">Select the correct choice</div>
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
