import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { Button } from '../common/controls';
import { convert } from 'utils/format';
import { InputList, InputListItem } from 'editors/content/common/InputList.tsx';
import { updateChoiceValuesAndRefs } from './MultipleChoice';
import {
    getGeneratedResponseBody, getGeneratedResponseScore,
    modelWithDefaultFeedback,
} from 'editors/content/part/defaultFeedbackGenerator.ts';
import { AUTOGEN_MAX_CHOICES } from '../part/ChoiceFeedback';
import { CombinationsMap } from 'types/combinations';
import { DragTypes } from 'utils/drag';

export interface ChoicesProps {
  itemModel: any;
  partModel: any;
  onEdit: (...args: any[]) => any;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
}

export interface ChoicesState {

}

/**
 * The content editor for Choices
 */
export class Choices
  extends React.PureComponent<ChoicesProps, ChoicesState> {

  constructor(props) {
    super(props);

    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onReorderChoices = this.onReorderChoices.bind(this);
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

  onRemoveChoice(choice: contentTypes.Choice) {
    const {
      itemModel, partModel, onGetChoiceCombinations, onEdit,
    } = this.props;

    let updatedItemModel = itemModel;
    let updatedPartModel = partModel;
    updatedItemModel = itemModel.with({
      choices: itemModel.choices.delete(choice.guid),
    });

    // update models with new choices and references
    const updatedModels = updateChoiceValuesAndRefs(updatedItemModel, partModel, onEdit);
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
    const updatedModels = updateChoiceValuesAndRefs(updatedItemModel, partModel, onEdit);
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

  renderChoice(choice: contentTypes.Choice, index: number) {
    const { context, services, editMode, itemModel } = this.props;

    return (
      <InputListItem
        key={choice.guid}
        className="choice"
        id={choice.guid}
        label={convert.toAlphaNotation(index)}
        context={context}
        services={services}
        editMode={editMode}
        index={index}
        isDraggable={!itemModel.shuffle}
        onDragDrop={this.onReorderChoices}
        dragType={DragTypes.Choice}
        body={choice.body}
        onEdit={body => this.onChoiceEdit(choice.with({ body }))}
        onRemove={() => this.onRemoveChoice(choice)} />
    );
  }

  render() : JSX.Element {
    const { itemModel, editMode } = this.props;

    return (
      <div className="choices">
      <Button
        editMode={editMode}
        type="link"
        onClick={this.onAddChoice}>
        Add Choice
      </Button>
      <InputList>
      {
        itemModel.choices
          .toArray()
          .map((c, i) => this.renderChoice(c, i))
      }
      </InputList>
      </div>
    );
  }
}
