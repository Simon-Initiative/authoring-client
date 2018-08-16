import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ChoiceFeedback } from '../part/ChoiceFeedback';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { Button } from '../common/controls';
import { CombinationsMap } from 'types/combinations';
import { ChoiceList, Choice, updateChoiceValuesAndRefs } from 'editors/content/common/Choice';
import {
  AUTOGEN_MAX_CHOICES, autogenResponseFilter, getGeneratedResponseBody,
  getGeneratedResponseScore, modelWithDefaultFeedback,
} from 'editors/content/part/defaultFeedbackGenerator.ts';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import createGuid from 'utils/guid';

export interface CheckAllThatApplyProps extends QuestionProps<contentTypes.MultipleChoice> {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
}

export interface CheckAllThatApplyState extends QuestionState {

}

export const isComplexFeedback = (partModel: contentTypes.Part) => {
  const responses = partModel.responses.filter(autogenResponseFilter).toArray();

  // scoring is complex (advanced mode) if scores exist for multiple
  // responses OR score is not 0 or 1
  let prevEncounteredScore = false;
  const isAdvancedScoringMode = responses.length > 1 || responses.reduce(
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

export const resetAllFeedback = (partModel: contentTypes.Part) => {
  // remove all responses except the first (correct)
  let updateResponses = partModel.responses
    .filter(autogenResponseFilter)
    .slice(0, 1);

  // reset score of correct response
  updateResponses = updateResponses.map(r => r.with({ score: '1' }));

  const updatedPartModel = partModel.with({
    responses: updateResponses.toOrderedMap(),
  });

  return updatedPartModel;
};

export const findChoiceResponse = (
  responses: OrderedMap<string, contentTypes.Response>,
  choice: contentTypes.Choice,
) => {
  return responses.filter(autogenResponseFilter).find(
    (response) => {
      return !!response.match.split(',').find(m => m === choice.value);
    },
  );
};

/**
 * The content editor for Check All That Apply question.
 */
export class CheckAllThatApply extends Question<CheckAllThatApplyProps, CheckAllThatApplyState> {

  constructor(props) {
    super(props);

    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
    this.onToggleSimpleSelect = this.onToggleSimpleSelect.bind(this);
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onResponseAdd = this.onResponseAdd.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onReorderChoices = this.onReorderChoices.bind(this);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'check-all-that-apply';
  }

  componentDidMount() {
    const {
      partModel, model, advancedScoringInitialized, onToggleAdvancedScoring,
    } = this.props;

    super.componentDidMount();

    this.updateChoiceCombinations();

    // initialize advanced scoring if its not already
    if (!advancedScoringInitialized) {
      onToggleAdvancedScoring(model.guid, isComplexFeedback(partModel));
    }
  }

  componentDidUpdate() {
    this.updateChoiceCombinations();
  }

  updateChoiceCombinations() {
    const { itemModel, onGetChoiceCombinations } = this.props;

    if (itemModel.choices.size <= AUTOGEN_MAX_CHOICES) {
      onGetChoiceCombinations(itemModel.choices.size);
    }
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
      onGetChoiceCombinations,
    } = this.props;

    // if switching from advanced mode and feedback is complex, reset all feedback
    // so they are valid in simple mode. Otherwise, we can leave the feedback as-is
    if (advancedScoring && isComplexFeedback(partModel)) {
      let updatedPartModel = resetAllFeedback(partModel);

      // update part model with default feedback
      updatedPartModel = modelWithDefaultFeedback(
        updatedPartModel,
        itemModel.choices.toArray(),
        getGeneratedResponseBody(updatedPartModel),
        getGeneratedResponseScore(updatedPartModel),
        AUTOGEN_MAX_CHOICES,
        onGetChoiceCombinations,
      );

      onEdit(itemModel, updatedPartModel, updatedPartModel);
    }

    onToggleAdvancedScoring(model.guid);
  }

  onToggleSimpleSelect(response: contentTypes.Response, choice: contentTypes.Choice) {
    const { itemModel, partModel, onEdit } = this.props;

    // toggle choice value in all response matches. Essentially, the set
    // symmetric difference "XOR" of all response matches with choice value,
    // however when adding it gets added to the first response
    let updatedPartModel = partModel;
    const choiceResponse = findChoiceResponse(partModel.responses, choice);
    if (choiceResponse) {
      // remove choice from the response it was found in
      updatedPartModel = updatedPartModel.with({
        responses: updatedPartModel.responses.set(
          choiceResponse.guid,
          choiceResponse.with({
            match: choiceResponse.match.split(',').filter(m => m !== choice.value).join(','),
          }),
        ),
      });
    } else {
      // choice does not exist any responses, so add it to the first response
      updatedPartModel = updatedPartModel.with({
        responses: updatedPartModel.responses.set(
          response.guid,
          response.with({
            match: response.match.split(',').filter(m => m)
              .concat([choice.value]).join(','),
          })
          // set response score to 1 if score is less than 1
          .with({ score: +response.score < 1 ? '1' : response.score }),
        ),
      });
    }

    // verify the new reponses don't result in an invalid state
    // i.e. at least one choice is selected for any of the responses
    if (!updatedPartModel.responses.reduce((acc, val) => acc || val.match !== '', false)) {
      // choice selection is invalid, abort the update
      return;
    }

    // because we changed response match values, we must update choice refs
    // const updatedModels = updateChoiceValuesAndRefs(itemModel, updatedPartModel);

    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      itemModel.choices.toArray(),
      getGeneratedResponseBody(updatedPartModel),
      getGeneratedResponseScore(updatedPartModel),
      AUTOGEN_MAX_CHOICES,
      this.props.onGetChoiceCombinations,
    );

    onEdit(itemModel, updatedPartModel, itemModel);
  }

  onPartEdit(partModel: contentTypes.Part, src) {
    this.props.onEdit(this.props.itemModel, partModel, src);
  }

  onResponseAdd() {
    const { partModel } = this.props;

    const feedback = contentTypes.Feedback.fromText('', createGuid());
    const feedbacks = OrderedMap<string, contentTypes.Feedback>();

    const response = new contentTypes.Response({
      score: '0',
      // copy the response matches from the last existing response as default
      match: partModel.responses.filter(autogenResponseFilter).last().match,
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel, null);
  }

  onAddChoice() {
    const {
      itemModel, partModel, onGetChoiceCombinations, onEdit,
    } = this.props;

    const count = itemModel.choices.size;
    const value = String.fromCharCode(65 + count);

    const choice = contentTypes.Choice.fromText('', createGuid()).with({ value });

    let updatedItemModel = itemModel;
    let updatedPartModel = partModel;
    updatedItemModel = itemModel.with(
      { choices: itemModel.choices.set(choice.guid, choice) });

    // update part model with default feedback
    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      updatedItemModel.choices.toArray(),
      getGeneratedResponseBody(updatedPartModel),
      getGeneratedResponseScore(updatedPartModel),
      AUTOGEN_MAX_CHOICES,
      onGetChoiceCombinations,
    );

    onEdit(
      updatedItemModel,
      updatedPartModel,
      null,
    );
  }

  onRemoveChoice(choiceId: string) {
    const {
      itemModel, partModel, onGetChoiceCombinations, onEdit,
    } = this.props;

    let updatedItemModel = itemModel;
    let updatedPartModel = partModel;

    // prevent removal of last choice
    if (itemModel.choices.size > 1) {
      updatedItemModel = itemModel.with({
        choices: itemModel.choices.delete(choiceId),
      });

      // update models with new choices and references
      const updatedModels = updateChoiceValuesAndRefs(updatedItemModel, partModel);
      updatedItemModel = updatedModels.itemModel;
      updatedPartModel = updatedModels.partModel;

      // update part model with default feedback
      updatedPartModel = modelWithDefaultFeedback(
        updatedPartModel,
        updatedItemModel.choices.toArray(),
        getGeneratedResponseBody(updatedPartModel),
        getGeneratedResponseScore(updatedPartModel),
        AUTOGEN_MAX_CHOICES,
        onGetChoiceCombinations,
      );

      onEdit(
        updatedItemModel,
        updatedPartModel,
        null,
      );
    }
  }

  onReorderChoices(originalIndex: number, newIndex: number) {
    const { onEdit, itemModel, partModel } = this.props;

    // convert OrderedMap to shallow javascript array
    const choices = itemModel.choices.toArray();

    // remove selected choice from array and insert it into new position
    const choice = choices.splice(originalIndex, 1)[0];
    choices.splice(newIndex, 0, choice);

    // update item model
    let updatedItemModel = itemModel;
    let updatedPartModel = partModel;
    updatedItemModel = itemModel.with({
      // set choices to a new OrderedMap with updated choice ordering
      choices: choices.reduce(
        (acc, c) => {
          return acc.set(c.guid, c);
        },
        OrderedMap<string, contentTypes.Choice>(),
      ),
    });

    // update models with new choices and references
    const updatedModels = updateChoiceValuesAndRefs(updatedItemModel, partModel);
    updatedItemModel = updatedModels.itemModel;
    updatedPartModel = updatedModels.partModel;

    onEdit(
      updatedItemModel,
      updatedPartModel,
      null,
    );
  }

  onChoiceEdit(c, src) {

    const {
      itemModel, partModel, onGetChoiceCombinations, onEdit,
    } = this.props;

    let updatedItemModel = itemModel;
    let updatedPartModel = partModel;
    updatedItemModel = updatedItemModel.with({
      choices: this.props.itemModel.choices.set(c.guid, c),
    });

    // update part model with default feedback
    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      updatedItemModel.choices.toArray(),
      getGeneratedResponseBody(updatedPartModel),
      getGeneratedResponseScore(updatedPartModel),
      AUTOGEN_MAX_CHOICES,
      onGetChoiceCombinations,
    );

    onEdit(
      updatedItemModel,
      updatedPartModel,
      src,
    );

  }

  renderChoices() {
    const { context, services, editMode, itemModel, partModel } = this.props;

    // the first response is used for simple selection
    const response = partModel.responses.first();

    return itemModel.choices
      .toArray()
      .map((choice, index) => {
        return (
          <Choice
            activeContentGuid={this.props.activeContentGuid}
            hover={this.props.hover}
            onUpdateHover={this.props.onUpdateHover}
            onFocus={this.props.onFocus}
            key={choice.guid}
            index={index}
            choice={choice}
            allowReorder={!itemModel.shuffle}
            simpleSelectProps={{
              selected: !!findChoiceResponse(partModel.responses, choice),
              onToggleSimpleSelect: this.onToggleSimpleSelect,
            }}
            response={response}
            context={context}
            services={services}
            editMode={editMode}
            onReorderChoice={this.onReorderChoices}
            onEditChoice={this.onChoiceEdit}
            onRemove={itemModel.choices.size > 1
              ? choiceId => this.onRemoveChoice(choiceId)
              : undefined
            } />
        );
      });
  }

  renderDetails() {
    const {
      editMode, itemModel, partModel, onGetChoiceCombinations, advancedScoring,
    } = this.props;

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Choices">
            <TabOptionControl name="add-choice">
              <Button
                editMode={editMode}
                type="link"
                onClick={this.onAddChoice}>
                Add Choice
              </Button>
            </TabOptionControl>
            <TabOptionControl name="shuffle">
              <ToggleSwitch
                checked={itemModel.shuffle}
                label="Shuffle"
                onClick={this.onToggleShuffle} />
            </TabOptionControl>
            <TabOptionControl name="advanced">
              <ToggleSwitch
                checked={advancedScoring}
                label="Advanced"
                onClick={this.onToggleAdvanced} />
            </TabOptionControl>
          </TabSectionHeader>
          <TabSectionContent>
            <div className="instruction-label">Select the correct choices and provide feedback</div>
            <ChoiceList>
              {this.renderChoices()}
            </ChoiceList>
          </TabSectionContent>
        </TabSection>
        <TabSection key="feedback" className="feedback">
          <TabSectionHeader title="Feedback">
            {advancedScoring
              ? (
                <TabOptionControl name="add-feedback">
                  <Button
                    editMode={editMode}
                    type="link"
                    onClick={this.onResponseAdd}>
                    Add Feedback
                  </Button>
                </TabOptionControl>
              )
              : (null)
            }
          </TabSectionHeader>
          <TabSectionContent>
            <ChoiceFeedback
              {...this.props}
              simpleFeedback={!advancedScoring}
              model={partModel}
              choices={itemModel.choices.toArray()}
              onGetChoiceCombinations={onGetChoiceCombinations}
              onEdit={this.onPartEdit} />
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
