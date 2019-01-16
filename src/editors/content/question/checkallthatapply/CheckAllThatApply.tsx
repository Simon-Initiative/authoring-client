import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ChoiceFeedback } from '../../part/ChoiceFeedback';
import {
  Question, QuestionProps, QuestionState,
} from '../question/Question';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { Button } from '../../common/controls';
import { CombinationsMap } from 'types/combinations';
import { ChoiceList, Choice, updateChoiceValuesAndRefs } from 'editors/content/common/Choice';
import {
  AUTOGEN_MAX_CHOICES, autogenResponseFilter, getGeneratedResponseItem,
  modelWithDefaultFeedback,
} from 'editors/content/part/defaultFeedbackGenerator';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import createGuid from 'utils/guid';
import { ContentElements } from 'data/content/common/elements';
import { ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';

export interface CheckAllThatApplyProps extends QuestionProps<contentTypes.MultipleChoice> {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
}

export interface CheckAllThatApplyState extends QuestionState {
  invalidChoice?: string;
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

// returns responses if the choice is part of a user created response (either its marked correct
// or is matched in advanced mode)
// this is the predicate for a choice to be marked green
export const findChoiceResponse = (
  responses: OrderedMap<string, contentTypes.Response>,
  choice: contentTypes.Choice,
) => {
  const best = getCorrectResponse(responses);
  if (best.match.includes(choice.value)) {
    return best;
  }
  return responses.filter(autogenResponseFilter).find(
    (response) => {
      return !!response.match.split(',').find(m => m === choice.value);
    },
  );
};

export function getCorrectResponse(responses: OrderedMap<string, contentTypes.Response>)
  : contentTypes.Response {
  let highestScore = 0;
  let correctResponse = undefined;
  responses.forEach((response) => {
    if (!response.name.match(/^AUTOGEN.*/) && response.score) {
      const score = +response.score;
      if (score > highestScore) {
        correctResponse = response;
        highestScore = score;
      }
    }
  });

  return correctResponse || responses.first();
}

export const getChoiceValue = (model: contentTypes.MultipleChoice, key: string) => {
  return model.choices.get(key).value;
};

/**
 * The content editor for Check All That Apply question.
 */
export class CheckAllThatApply extends Question<CheckAllThatApplyProps, CheckAllThatApplyState> {
  guy: string;
  prev: any;

  constructor(props) {
    super(props);

    this.state = {};

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

      const generated = getGeneratedResponseItem(updatedPartModel);
      const body = generated ? generated.feedback.first().body
        : ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);

      // update part model with default feedback
      updatedPartModel = modelWithDefaultFeedback(
        updatedPartModel,
        itemModel.choices.toArray(),
        body,
        generated ? generated.score : '0',
        AUTOGEN_MAX_CHOICES,
        onGetChoiceCombinations,
      );

      onEdit(itemModel, updatedPartModel, updatedPartModel);
    }

    onToggleAdvancedScoring(model.guid);
  }

  // pass the child choicefeedback (choice responses) a state consisten with the
  // on seen by the user, in the event the user has no correct choice (this.state.invalidChoice)
  hideStateIfInvalid = (partModel: contentTypes.Part) => {
    if (!this.state.invalidChoice) {
      return partModel;
    }

    const invalidChoiceValue = getChoiceValue(this.props.itemModel, this.state.invalidChoice);
    const correct = getCorrectResponse(partModel.responses);

    return partModel.with({
      responses: partModel.responses.set(correct.guid, correct.with({
        match: correct.match.split(',').filter(x => x !== invalidChoiceValue).join(','),
      })),
    });
  }

  onToggleSimpleSelect(r: contentTypes.Response, choice: contentTypes.Choice) {
    const { itemModel, partModel, onEdit } = this.props;
    const correct = getCorrectResponse(partModel.responses);
    let updatedPartModel = partModel;

    // this choice was the last correct choice and was unchecked but is now rechecked
    // there is no longer an invalid choice
    if (this.state.invalidChoice === choice.guid) {
      this.setState({ invalidChoice: '' });
      return;
    }

    // toggle choice value in all response matches. Essentially, the set
    // symmetric difference "XOR" of all response matches with choice value,
    // however when adding it gets added to the correct response
    if (correct.match.includes(choice.value)) {
      if (correct.match.split(',').length <= 1) {
        this.setState({ invalidChoice: choice.guid });
        return;
      }
      // remove choice from the response it was found in
      updatedPartModel = updatedPartModel.with({
        responses: updatedPartModel.responses.set(
          correct.guid,
          correct.with({
            match: correct.match.split(',').filter(m => m !== choice.value).join(','),
          }),
        ),
      });
    } else {
      // choice does not have any responses, so add it to the correct response

      // there were no correct responses but now there are
      let invalidChoiceValue = undefined;
      if (this.state.invalidChoice) {
        invalidChoiceValue = getChoiceValue(itemModel, this.state.invalidChoice);
      }
      updatedPartModel = updatedPartModel.with({
        responses: updatedPartModel.responses.set(
          correct.guid,
          correct.with({
            match: correct.match.split(',').filter(m => m !== invalidChoiceValue)
              .concat([choice.value]).join(','),
          })
            // set response score to 1 if score is less than 1
            .with({ score: +correct.score < 1 ? '1' : correct.score }),
        ),
      });
      if (invalidChoiceValue) {
        this.setState({ invalidChoice: '' });
      }
    }

    // verify the new reponses don't result in an invalid state
    // i.e. at least one choice is selected for any of the responses
    if (!updatedPartModel.responses.reduce((acc, val) => acc || val.match !== '', false)) {
      // choice selection is invalid, abort the update
      return;
    }

    // because we changed response match values, we must update choice refs
    // const updatedModels = updateChoiceValuesAndRefs(itemModel, updatedPartModel);

    const generated = getGeneratedResponseItem(updatedPartModel);
    const body = generated ? generated.feedback.first().body
      : ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);

    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      itemModel.choices.toArray(),
      body,
      generated ? generated.score : '0',
      AUTOGEN_MAX_CHOICES,
      this.props.onGetChoiceCombinations,
    );

    onEdit(itemModel, updatedPartModel, itemModel);
  }

  onPartEdit(partModel: contentTypes.Part, src) {
    // the state is currently being hidden because there were no correct answers
    if (this.state.invalidChoice) {
      const correct = getCorrectResponse(partModel.responses);
      const len = correct.match.split(',').length;

      // state of correct match is hidden from child, dont propagate this change
      if (correct.match === '') return;
      // there is a new correct answer or an additional correct answer was added
      // by the advanced view, stop hiding state
      if (len >= 1) {
        this.setState({ invalidChoice: '' });
      }
    }

    this.props.onEdit(this.props.itemModel, partModel, src);
  }

  onResponseAdd() {
    const { partModel } = this.props;

    const feedback = contentTypes.Feedback.fromText('', createGuid());
    const feedbacks = OrderedMap<string, contentTypes.Feedback>();

    const response = (new contentTypes.Response({
      // copy the response matches from the last existing response as default
      match: partModel.responses.filter(autogenResponseFilter).last().match,
      feedback: feedbacks.set(feedback.guid, feedback),
    })).with({ score: '0' });

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

    const generated = getGeneratedResponseItem(updatedPartModel);
    const body = generated ? generated.feedback.first().body
      : ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);

    // update part model with default feedback
    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      updatedItemModel.choices.toArray(),
      body,
      generated ? generated.score : '0',
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
      const choiceVal = getChoiceValue(itemModel, choiceId);

      updatedItemModel = itemModel.with({
        choices: itemModel.choices.delete(choiceId),
      });

      // choose another correct choice if the only one was removed
      const correct = getCorrectResponse(updatedPartModel.responses);
      if (correct.match === choiceVal) {
        const firstChoice = updatedItemModel.choices.first();

        updatedPartModel = updatedPartModel.with({
          responses: updatedPartModel.responses.set(correct.guid, correct.with({
            match: firstChoice.value,
          })),
        });
      }

      // update models with new choices and references
      const updatedModels = updateChoiceValuesAndRefs(updatedItemModel, updatedPartModel);
      updatedItemModel = updatedModels.itemModel;
      updatedPartModel = updatedModels.partModel;

      const generated = getGeneratedResponseItem(updatedPartModel);
      const body = generated ? generated.feedback.first().body
        : ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);

      // update part model with default feedback
      updatedPartModel = modelWithDefaultFeedback(
        updatedPartModel,
        updatedItemModel.choices.toArray(),
        body,
        generated ? generated.score : '0',
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

    const generated = getGeneratedResponseItem(updatedPartModel);
    const body = generated ? generated.feedback.first().body
      : ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);

    // update part model with default feedback
    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      updatedItemModel.choices.toArray(),
      body,
      generated ? generated.score : '0',
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

    // the highest scored response is used for simple selection (or the first response)
    const response: contentTypes.Response = getCorrectResponse(partModel.responses);
    const correctMatches = getCorrectResponse(partModel.responses).match;
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
              selected: correctMatches.includes(choice.value) &&
                choice.guid !== this.state.invalidChoice,
              onToggleSimpleSelect: this.onToggleSimpleSelect,
            }}
            wasLastCorrectChoice={this.state.invalidChoice === choice.guid}
            response={response}
            context={context}
            services={services}
            editMode={editMode}
            onReorderChoice={this.onReorderChoices}
            onEditChoice={this.onChoiceEdit}
            onRemove={itemModel.choices.size > 1
              ? choiceId => this.onRemoveChoice(choiceId)
              : undefined
            }
            branchingQuestions={this.props.branchingQuestions}
          />
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
              model={this.hideStateIfInvalid(partModel)}
              choices={itemModel.choices.toArray()}
              onGetChoiceCombinations={onGetChoiceCombinations}
              onInvalidFeedback={(responseGuid) => {
                const responses = partModel.responses;
                if (getCorrectResponse(responses).guid === responseGuid) {
                  const choiceValues = responses.get(responseGuid).match.split(',');
                  if (choiceValues.length > 0) {
                    const val = choiceValues[0];
                    itemModel.choices.forEach((choice) => {
                      if (choice.value === val) {
                        this.setState({
                          invalidChoice: choice.guid,
                        });
                        return false;
                      }
                    });
                  }
                }
              }}
              hideOther={itemModel.choices.size <= 1}
              onEdit={this.onPartEdit}
              branchingQuestions={this.props.branchingQuestions}
            />
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
