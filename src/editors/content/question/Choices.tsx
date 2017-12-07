
import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Button } from '../common/controls';
import { Choice } from '../common/Choice';
import { DragDropContext } from 'react-dnd';

export interface ChoicesProps {
  itemModel: any;
  partModel: any;
  onEdit: (...args: any[]) => any;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
}

export interface ChoicesState {

}

/**
 * The content editor for Choices
 */
export class Choices
  extends React.Component<ChoicesProps, ChoicesState> {

  constructor(props) {
    super(props);

    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.updateChoiceOrder = this.updateChoiceOrder.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  onAddChoice() {
    const count = this.props.itemModel.choices.size;
    const value = String.fromCharCode(65 + count);

    const choice = new contentTypes.Choice().with({ value });

    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(choice.guid, choice) });

    this.props.onEdit(itemModel, this.props.partModel);
  }

  onRemoveChoice(choice: contentTypes.Choice) {
    let itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });

    itemModel = this.updateChoiceValues(itemModel);

    const partModel = this.updateChoiceReferences(choice.value, this.props.partModel);

    this.props.onEdit(itemModel, partModel);
  }

  updateChoiceOrder(originalIndex, newIndex) {
    const { onEdit, itemModel, partModel } = this.props;

    // indexOffset makes up for the missing item in the list when splicing,
    // this is only an issue if the new item position is less than the current one
    const indexOffset = originalIndex > newIndex ? 1 : 0;

    // convert OrderedMap to shallow javascript array
    const choices = itemModel.choices.toArray();

    // remove selected choice from array and insert it into new position
    const choice = choices.splice(originalIndex, 1)[0];
    choices.splice(newIndex + indexOffset, 0, choice);

    onEdit(
      itemModel.with({
        // set choices to a new OrderedMap with updated choice ordering
        choices: choices.reduce(
          (acc, c) => {
            return acc.set(c.guid, c);
          },
          Immutable.OrderedMap<string, Choice>(),
        ),
      }),
      partModel,
    );
  }

  onChoiceEdit(c) {
    this.props.onEdit(
      this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(c.guid, c) }),
      this.props.partModel);
  }

  toLetter(index) {
    return String.fromCharCode(65 + index);
  }

  updateChoiceValues(itemModel: contentTypes.MultipleChoice) : contentTypes.MultipleChoice {
    const choices = itemModel.choices.toArray();
    let newChoices = Immutable.OrderedMap<string, contentTypes.Choice>();

    choices.forEach((choice, index) => {
      const value = this.toLetter(index);
      const updated = choice.with({ value });
      newChoices = newChoices.set(updated.guid, updated);
    });

    return itemModel.with({ choices: newChoices });
  }

  updateChoiceReferences(removedValue, partModel: contentTypes.Part) : contentTypes.Part {
    // For each response, adjust matches that may have
    // utilized the removedValue...
    return partModel;
  }

  renderChoice(choice: contentTypes.Choice, index: number) {
    return (
      <Choice
        key={choice.guid}
        index={index}
        {...this.props}
        model={choice}
        isDraggable={true}
        onDragDrop={this.updateChoiceOrder}
        onEdit={this.onChoiceEdit}
        onRemove={this.onRemoveChoice.bind(this, choice)}
        />
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
      {
        itemModel.choices
          .toArray()
          .map((c, i) => this.renderChoice(c, i))
      }
      </div>
    );
  }
}
