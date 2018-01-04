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

const isComplexScoring = (partModel: contentTypes.Part) => {
  const responses = partModel.responses.toArray();

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

const resetAllScores = (partModel: contentTypes.Part) => {
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
  advScoringInit: boolean;
  advancedScoring: boolean;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
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
    this.onToggleScoring = this.onToggleScoring.bind(this);
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
      partModel, model, advScoringInit, advancedScoring, onToggleAdvancedScoring,
    } = this.props;

    // initialize advanced scoring if its not already
    if (!advScoringInit) {
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

    onEdit(itemModel.with({ shuffle: !itemModel.shuffle }), partModel);
  }

  onToggleScoring() {
    const {
      itemModel, partModel, model, onToggleAdvancedScoring, advancedScoring, onEdit,
    } = this.props;

    // if switching from advanced mode and scoring is complex, reset all scores
    // so they are valid in simple mode. Otherwise, we can leave the scores as-is
    if (advancedScoring && isComplexScoring(partModel)) {
      const updatedPartModel = resetAllScores(partModel);
      onEdit(itemModel, updatedPartModel);
    }

    onToggleAdvancedScoring(model.guid);
  }

  onToggleSimpleSelect(response: contentTypes.Response) {
    const { itemModel, partModel, onEdit } = this.props;

    let updatedPartModel = resetAllScores(partModel);

    updatedPartModel = updatedPartModel.with({
      responses: updatedPartModel.responses.set(
        response.guid, response.with({ score: response.score === '0' ? '1' : '0' }),
      ),
    });

    onEdit(itemModel, updatedPartModel);
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
    const { context, services, editMode, partModel, itemModel, advancedScoring } = this.props;

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
          allowScore={advancedScoring}
          allowSimpleSelect
          response={response}
          allowReorder={!itemModel.shuffle}
          context={context}
          services={services}
          editMode={editMode}
          onReorderChoice={this.onReorderChoices}
          onEditChoice={this.onChoiceEdit}
          onEditFeedback={this.onFeedbackEdit}
          onEditScore={this.onScoreEdit}
          onToggleSimpleSelect={this.onToggleSimpleSelect}
          onRemove={choiceId => this.onRemoveChoice(choiceId, response)} />
      );
    });
  }

  renderDetails() {
    const { editMode, itemModel, advancedScoring } = this.props;

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Choices">
            <TabOptionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
              <ToggleSwitch checked={itemModel.shuffle} />
            </TabOptionControl>
            <TabOptionControl key="advancedscoring" name="Advanced" onClick={this.onToggleScoring}>
              <ToggleSwitch checked={advancedScoring} />
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
