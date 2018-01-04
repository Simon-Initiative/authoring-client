import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
    AbstractItemPartEditor, AbstractItemPartEditorProps,
    AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import { Button } from '../common/controls';
import guid from 'utils/guid';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { ChoiceList, Choice, updateChoiceValuesAndRefs } from 'editors/content/common/Choice';
import { ToggleSwitch } from 'components/common/ToggleSwitch';

export interface FillInTheBlankProps
  extends AbstractItemPartEditorProps<contentTypes.FillInTheBlank> {

}

export interface FillInTheBlankState extends AbstractItemPartEditorState {

}

/**
 * FillInTheBlank Question Editor
 */
export class FillInTheBlank
  extends AbstractItemPartEditor<contentTypes.FillInTheBlank,
    FillInTheBlankProps, FillInTheBlankState> {

  constructor(props) {
    super(props);

    this.onFeedbackEdit = this.onFeedbackEdit.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onEditMult = this.onEditMult.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onReorderChoices = this.onReorderChoices.bind(this);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const updated = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    const part = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) },
    );
    onEdit(itemModel, part);
  }

  onAddChoice() {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const value = guid().replace('-', '');
    const match = value;
    const choice = new contentTypes.Choice().with({ value });
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response().with({ match, input: itemModel.id });
    response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });

    const newItemModel = itemModel.with(
      { choices: itemModel.choices.set(choice.guid, choice) });
    const newPartModel = partModel.with(
      { responses: partModel.responses.set(response.guid, response) });

    onEdit(newItemModel, newPartModel);
  }

  onRemoveChoice(choiceId: string, response: contentTypes.Response) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const newItemModel = itemModel.with(
      { choices: itemModel.choices.delete(choiceId) });
    const newPartModel = partModel.with(
      { responses: partModel.responses.delete(response.guid) });

    onEdit(newItemModel, newPartModel);
  }

  onChoiceEdit(choice: contentTypes.Choice) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(
      itemModel.with(
      { choices: itemModel.choices.set(choice.guid, choice) }),
      partModel);
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
        OrderedMap<string, contentTypes.Choice>(),
      ),
    });

    // update models with new choices and references
    const newModels = updateChoiceValuesAndRefs(updatedItemModel, partModel);

    onEdit(
      newModels.itemModel,
      newModels.partModel,
    );
  }

  onToggleShuffle() {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ shuffle: !itemModel.shuffle }), partModel);
  }

  onEditMult(mult: contentTypes.ResponseMult) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const responseMult = partModel.responseMult.set(mult.guid, mult);
    const newPartModel = partModel.with({ responseMult });
    onEdit(itemModel, newPartModel);
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const updated = response.with({ score });
    const newPartModel = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) });
    onEdit(itemModel, newPartModel);
  }

  renderChoices() {
    const { context, services, editMode, partModel, itemModel } = this.props;

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
          allowScore
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
    });
  }

  render() {
    const {
      editMode,
      itemModel,
    } = this.props;

    return (
      <TabSection className="choices">
        <TabSectionHeader title="Choices">
          <TabOptionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
            <ToggleSwitch checked={itemModel.shuffle} />
          </TabOptionControl>
        </TabSectionHeader>
        <TabSectionContent>
          <div style={ { display: 'inline' } }>
            <Button editMode={editMode}
              type="link" onClick={this.onAddChoice}>Add Choice</Button>
          </div>
          <ChoiceList>
            {this.renderChoices()}
          </ChoiceList>
        </TabSectionContent>
      </TabSection>
    );
  }
}
