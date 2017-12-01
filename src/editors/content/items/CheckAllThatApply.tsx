import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import * as Immutable from 'immutable';
import { Choice } from './Choice';
import { TabularFeedback } from '../part/TabularFeedback';
import { Button } from '../common/controls';
import guid from 'utils/guid';
import { Question, QuestionProps, QuestionState,
Section, SectionContent, SectionHeader, OptionControl, SectionControl } from './Question';

export interface CheckAllThatApplyProps extends QuestionProps<contentTypes.MultipleChoice> {

}

export interface CheckAllThatApplyState extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class CheckAllThatApply extends Question<CheckAllThatApplyProps, CheckAllThatApplyState> {

  constructor(props) {
    super(props);

    this.setClassname('check-all-that-apply');

    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
  }

  onToggleShuffle(e) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ shuffle: e.target.value }), partModel);
  }

  onToggleAdvanced(e) {
    // TODO
    console.log('onToggleAdvancedMode NOT IMPLEMENTED');
  }

  onAddChoice() {
    const count = this.props.itemModel.choices.size;
    const value = String.fromCharCode(65 + count);

    const choice = new contentTypes.Choice().with({ value });

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
    return (
      <Choice
        key={choice.guid}
        label={'Choice ' + this.toLetter(index)}
        {...this.props}
        model={choice}
        onEdit={this.onChoiceEdit}
        onRemove={this.onRemoveChoice.bind(this, choice)}
        />
    );
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  updateChoiceReferences(removedValue, partModel: contentTypes.Part) : contentTypes.Part {
    // For each response, adjust matches that may have
    // utilized the removedValue...
    return partModel;
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

  onRemoveChoice(choice: contentTypes.Choice) {
    let itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });

    itemModel = this.updateChoiceValues(itemModel);

    const partModel = this.updateChoiceReferences(choice.value, this.props.partModel);

    this.props.onEdit(itemModel, partModel);
  }

  renderChoices() {
    const { itemModel } = this.props;

    return itemModel.choices
      .toArray()
      .map((c, i) => this.renderChoice(c, i));
  }

  renderAdditionalOptions() {
    return [
      <OptionControl key="advanced" name="Advanced" onClick={this.onToggleAdvanced}>
        <div className="control">
          <input className="toggle toggle-light" type="checkbox" checked={false} />
          <label className="toggle-btn"></label>
        </div>
      </OptionControl>,
    ];
  }

  renderAdditionalSections() {
    const { editMode, itemModel, partModel } = this.props;

    return ([
      <Section key="choices" name="choices">
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
      <Section key="feedback" name="feedback">
        <SectionHeader title="Feedback"/>
        <SectionContent>
          <TabularFeedback
            {...this.props}
            model={partModel}
            onEdit={this.onPartEdit} />
        </SectionContent>
      </Section>,
    ]);
  }

}
