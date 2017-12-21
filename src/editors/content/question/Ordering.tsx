import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Choice } from '../common/Choice';
import { TabularFeedback } from '../part/TabularFeedback';
import { Button } from '../common/controls';
import guid from '../../../utils/guid';
import {
    Question, QuestionProps, QuestionState, Section, SectionContent, SectionControl,
    SectionHeader,
} from './Question';

export interface OrderingProps extends QuestionProps<contentTypes.Ordering> {

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
    const value = this.toLetter(count);

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

  toLetter(index) {
    return String.fromCharCode(65 + index);
  }

  renderChoice(choice: contentTypes.Choice, index: number) {
    return <Choice
              key={choice.guid}
              label={'Choice ' + this.toLetter(index)}
              context={this.props.context}
              services={this.props.services}
              editMode={this.props.editMode}
              model={choice}
              onEdit={this.onChoiceEdit}
              onRemove={this.onRemoveChoice.bind(this, choice)}
              />;
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  updateChoiceReferences(removedValue, partModel: contentTypes.Part) : contentTypes.Part {
    // For each response, adjust matches that may have
    // utilized the removedValue...

    return partModel;
  }

  updateChoiceValues(itemModel: contentTypes.Ordering) : contentTypes.Ordering {

    const choices = itemModel.choices.toArray();
    let newChoices = Immutable.OrderedMap<string, contentTypes.Choice>();

    choices.forEach((choice, index) => {
      const value = this.toLetter(index);
      const updated = choice.with({ value });
      newChoices = newChoices.set(updated.guid, updated);
    });

    return itemModel.with({ choices: newChoices });
  }

  onRemoveChoice(choice: contentTypes.Choice) {
    let itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });

    itemModel = this.updateChoiceValues(itemModel);
    const partModel = this.updateChoiceReferences(choice.value, this.props.partModel);

    this.props.onEdit(itemModel, partModel);
  }

  renderChoices() {
    return this.props.itemModel.choices
      .toArray()
      .map((c, i) => this.renderChoice(c, i));
  }

  renderAdditionalSections() {
    const { context, services, editMode, itemModel, partModel } = this.props;

    return ([
      <Section key="choices" className="choices">
        <SectionHeader title="Choices">
          <SectionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
            <input
              className="toggle toggle-light"
              type="checkbox"
              checked={itemModel.shuffle} />
            <label className="toggle-btn"></label>
          </SectionControl>
        </SectionHeader>
        <SectionContent>
          <Button
            editMode={editMode}
            type="link"
            onClick={this.onAddChoice}>
            Add Choice
          </Button>
          {this.renderChoices()}
        </SectionContent>
      </Section>,
      <Section key="feedback" className="feedback">
        <SectionHeader title="Feedback"/>
        <SectionContent>
          <TabularFeedback
              context={context}
              services={services}
              editMode={editMode}
              model={partModel}
              onEdit={this.onPartEdit} />
        </SectionContent>
      </Section>,
    ]);
  }
}

