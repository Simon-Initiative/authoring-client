
import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Button } from '../common/controls';
import { DragDropContext } from 'react-dnd';
import { convert } from 'utils/format';
import {
  InputList, InputListItem, ItemOptions, ItemOption, ItemControl, ItemOptionFlex,
} from 'editors/content/common/InputList.tsx';
import { updateChoiceValuesAndRefs } from './MultipleChoice';

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
  extends React.PureComponent<ChoicesProps, ChoicesState> {

  constructor(props) {
    super(props);

    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onReorderChoices = this.onReorderChoices.bind(this);
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
    let { itemModel } = this.props;
    const { partModel, onEdit } = this.props;

    itemModel = itemModel.with({
      choices: itemModel.choices.delete(choice.guid),
    });

    // update models with new choices and references
    updateChoiceValuesAndRefs(itemModel, partModel, onEdit);
  }

  onReorderChoices(originalIndex, newIndex) {
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
    updateChoiceValuesAndRefs(updatedItemModel, partModel, onEdit);
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
