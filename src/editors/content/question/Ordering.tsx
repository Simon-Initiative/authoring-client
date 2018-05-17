import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { ChoiceList, Choice, updateChoiceValuesAndRefs } from '../common/Choice';
import { Button } from '../common/controls';
import guid from '../../../utils/guid';
import {
    Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { PermutationsMap } from 'types/combinations';
import { ChoiceFeedback } from '../part/ChoiceFeedback';
import { convert } from 'utils/format';
import { ToggleSwitch } from 'components/common/ToggleSwitch';

export interface OrderingProps extends QuestionProps<contentTypes.Ordering> {
  onGetChoicePermutations: (comboNum: number) => PermutationsMap;
}

export interface OrderingState extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class Ordering extends Question<OrderingProps, OrderingState> {

  constructor(props) {
    super(props);

    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onResponseAdd = this.onResponseAdd.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onReorderChoices = this.onReorderChoices.bind(this);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'ordering';
  }

  onToggleShuffle() {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ shuffle: !itemModel.shuffle }), partModel, null);
  }

  onAddChoice() {
    const count = this.props.itemModel.choices.size;
    const value = convert.toAlphaNotation(count);

    const choice = contentTypes.Choice.fromText('', guid()).with({ value });

    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(choice.guid, choice) });

    this.props.onEdit(itemModel, this.props.partModel, choice);
  }

  onChoiceEdit(choice: contentTypes.Choice, src) {

    this.props.onEdit(
      this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(choice.guid, choice) }),
      this.props.partModel, src);
  }

  onPartEdit(partModel: contentTypes.Part, src) {

    this.props.onEdit(this.props.itemModel, partModel, src);
  }

  onResponseAdd() {
    const { partModel } = this.props;

    const feedback = contentTypes.Feedback.fromText('', guid());
    const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

    const response = new contentTypes.Response({
      score: '0',
      match: '',
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel, feedback);
  }

  onRemoveChoice(choice: contentTypes.Choice) {
    const { partModel } = this.props;

    const updatedItemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });

    // itemModel = this.updateChoiceValues(itemModel);
    // const partModel = this.updateChoiceReferences(choice.value, this.props.partModel);

    const newModels = updateChoiceValuesAndRefs(updatedItemModel, partModel);

    this.props.onEdit(newModels.itemModel, newModels.partModel, null);
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
        Immutable.OrderedMap<string, contentTypes.Choice>(),
      ),
    });

    // update models with new choices and references
    const updatedModels = updateChoiceValuesAndRefs(updatedItemModel, partModel);
    updatedItemModel = updatedModels.itemModel;
    updatedPartModel = updatedModels.partModel;

    onEdit(
      updatedItemModel,
      updatedPartModel,
      choice,
    );
  }

  renderChoices() {
    const { itemModel, context, services, editMode } = this.props;

    return this.props.itemModel.choices
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
            context={context}
            services={services}
            editMode={editMode}
            onReorderChoice={this.onReorderChoices}
            onEditChoice={this.onChoiceEdit}
            onRemove={choiceId => this.onRemoveChoice(choice)} />
        );
      });
  }

  renderDetails() {
    const {
      editMode, itemModel, partModel, onGetChoicePermutations,
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
          </TabSectionHeader>
          <TabSectionContent>
            <ChoiceList className="ordering-question-choices">
              {this.renderChoices()}
            </ChoiceList>
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
              onGetChoiceCombinations={onGetChoicePermutations}
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

