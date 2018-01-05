import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { AUTOGEN_MAX_CHOICES, ChoiceFeedback } from '../part/ChoiceFeedback';
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
    getGeneratedResponseBody, getGeneratedResponseScore,
    modelWithDefaultFeedback,
} from 'editors/content/part/defaultFeedbackGenerator.ts';
import { ToggleSwitch } from 'components/common/ToggleSwitch';

export interface CheckAllThatApplyProps extends QuestionProps<contentTypes.MultipleChoice> {
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
}

export interface CheckAllThatApplyState extends QuestionState {

}

/**
 * The content editor for Check All That Apply question.
 */
export class CheckAllThatApply extends Question<CheckAllThatApplyProps, CheckAllThatApplyState> {

  constructor(props) {
    super(props);

    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
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
    this.updateChoiceCombinations();
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

    onEdit(itemModel.with({ shuffle: !itemModel.shuffle }), partModel);
  }

  onToggleAdvanced(e) {
    // TODO
    console.log('onToggleAdvancedMode NOT IMPLEMENTED');
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  onResponseAdd() {
    const { partModel } = this.props;

    const feedback = new contentTypes.Feedback();
    const feedbacks = OrderedMap<string, contentTypes.Feedback>();

    const response = new contentTypes.Response({
      score: '0',
      match: '',
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel);
  }

  onAddChoice() {
    const {
      itemModel, partModel, onGetChoiceCombinations, onEdit,
    } = this.props;

    const count = itemModel.choices.size;
    const value = String.fromCharCode(65 + count);

    const choice = new contentTypes.Choice().with({ value });

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
    );
  }

  onRemoveChoice(choiceId: string) {
    const {
      itemModel, partModel, onGetChoiceCombinations, onEdit,
    } = this.props;

    let updatedItemModel = itemModel;
    let updatedPartModel = partModel;
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
    );
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
    );
  }

  onChoiceEdit(c) {
    this.props.onEdit(
      this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(c.guid, c) }),
      this.props.partModel);
  }

  renderChoices() {
    const { context, services, editMode, itemModel } = this.props;

    return itemModel.choices
      .toArray()
      .map((choice, index) => {
        return (
          <Choice
            key={choice.guid}
            index={index}
            choice={choice}
            allowReorder={!itemModel.shuffle}
            context={context}
            services={services}
            editMode={editMode}
            onReorderChoice={this.onReorderChoices}
            onEditChoice={this.onChoiceEdit}
            onRemove={choiceId => this.onRemoveChoice(choiceId)} />
        );
      });
  }


  renderDetails() {
    const {
      editMode, itemModel, partModel, onGetChoiceCombinations,
    } = this.props;

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
            <TabOptionControl key="advanced" name="Advanced" onClick={this.onToggleAdvanced}>
              <ToggleSwitch checked={false} />
            </TabOptionControl>
          </TabSectionHeader>
          <TabSectionContent>
            <div className="choices">
              <ChoiceList>
                {this.renderChoices()}
              </ChoiceList>
            </div>
          </TabSectionContent>
        </TabSection>
        <TabSection key="feedback" className="feedback">
          <TabSectionHeader title="Feedback">
            <TabOptionControl key="add-feedback" name="Add Feedback" hideLabel>
              <Button
                editMode={editMode}
                type="link"
                onClick={this.onResponseAdd}>
                Add Feedback
              </Button>
            </TabOptionControl>
          </TabSectionHeader>
          <TabSectionContent>
            <ChoiceFeedback
              {...this.props}
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
