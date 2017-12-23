import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { ChoiceList, Choice, updateChoiceValuesAndRefs } from '../common/Choice';
import { TabularFeedback } from '../part/TabularFeedback';
import { Button } from '../common/controls';
import guid from '../../../utils/guid';
import {
    Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabContainer, Tab, TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { CombinationsMap } from 'types/combinations';
import { ChoiceFeedback } from '../part/ChoiceFeedback';
import { convert } from 'utils/format';

export interface OrderingProps extends QuestionProps<contentTypes.Ordering> {
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
}

export interface OrderingState extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class Ordering extends Question<OrderingProps, OrderingState> {

  constructor(props) {
    super(props);

    this.setClassname('ordering');

    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onReorderChoices = this.onReorderChoices.bind(this);
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
    const count = this.props.itemModel.choices.size;
    const value = convert.toAlphaNotation(count);

    const choice = new contentTypes.Choice().with({ value, guid: guid() });

    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(choice.guid, choice) });

    this.props.onEdit(itemModel, this.props.partModel);
  }

  onChoiceEdit(c) {
    this.props.onEdit(
      this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(c.guid, c) }),
      this.props.partModel);
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  // updateChoiceReferences(removedValue, partModel: contentTypes.Part) : contentTypes.Part {
  //   // For each response, adjust matches that may have
  //   // utilized the removedValue...

  //   return partModel;
  // }

  // updateChoiceValues(itemModel: contentTypes.Ordering) : contentTypes.Ordering {

  //   const choices = itemModel.choices.toArray();
  //   let newChoices = Immutable.OrderedMap<string, contentTypes.Choice>();

  //   choices.forEach((choice, index) => {
  //     const value = convert.toAlphaNotation(index);
  //     const updated = choice.with({ value });
  //     newChoices = newChoices.set(updated.guid, updated);
  //   });

  //   return itemModel.with({ choices: newChoices });
  // }

  onRemoveChoice(choice: contentTypes.Choice) {
    const { itemModel, partModel } = this.props;

    const updatedItemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });

    // itemModel = this.updateChoiceValues(itemModel);
    // const partModel = this.updateChoiceReferences(choice.value, this.props.partModel);

    const newModels = updateChoiceValuesAndRefs(updatedItemModel, partModel);

    this.props.onEdit(newModels.itemModel, newModels.partModel);
  }

  onReorderChoices(originalIndex, newIndex) {
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
    );
  }

  renderChoices() {
    const { itemModel, context, services, editMode } = this.props;

    return this.props.itemModel.choices
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
            onRemove={choiceId => this.onRemoveChoice(choice)} />
        );
      });
  }

  renderDetails() {
    const {
      context, services, editMode, itemModel, partModel, onGetChoiceCombinations,
    } = this.props;

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
            <ChoiceList className="ordering-question-choices">
              {this.renderChoices()}
            </ChoiceList>
          </TabSectionContent>
        </TabSection>
        <TabSection key="feedback" className="feedback">
          <TabSectionHeader title="Feedback"/>
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

