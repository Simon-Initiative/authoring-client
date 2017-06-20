import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import * as Immutable from 'immutable';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, 
  AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { TextInput, InlineForm, InputLabel, Button, Checkbox, Collapse } from '../common/controls';
import guid from '../../../utils/guid';

import '../common/editor.scss';
import './MultipleChoice.scss';

type IdTypes = {
  shuffle: string,
};

export interface CheckAllThatApply {
  ids: IdTypes;
}

export interface CheckAllThatApplyProps 
  extends AbstractItemPartEditorProps<contentTypes.MultipleChoice> {

}

export interface CheckAllThatApplyState {

}

/**
 * The content editor for HtmlContent.
 */
export class CheckAllThatApply 
  extends AbstractItemPartEditor<contentTypes.MultipleChoice, 
    CheckAllThatApplyProps, CheckAllThatApplyState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: [],
    };
    this.ids = {
      shuffle: guid(),
    };
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onShuffleChange = this.onShuffleChange.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onExplanation = this.onExplanation.bind(this);
  }

  onExplanation(explanation) {
    const part = this.props.partModel.with({ explanation });
    this.props.onEdit(this.props.itemModel, part);
  }

  onShuffleChange(e) {
    this.props.onEdit(this.props.itemModel.with({ shuffle: e.target.value }), this.props.partModel);
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

  onShuffleEdit(shuffle: boolean) {
    const itemModel = this.props.itemModel.with({ shuffle });
    this.props.onEdit(itemModel, this.props.partModel);
  }

  renderChoices() {
    return this.props.itemModel.choices
      .toArray()
      .map((c, i) => this.renderChoice(c, i));
  }

  render() : JSX.Element {
    
    const bodyStyle = {
      minHeight: '75px',
      borderStyle: 'solid',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    const expanded = (
      <div style={{ display: 'inline' }}>
        <Button editMode={this.props.editMode} 
          type="link" onClick={this.onAddChoice}>Add Choice</Button>
        <Checkbox editMode={this.props.editMode} 
          label="Shuffle" value={this.props.itemModel.shuffle} 
          onEdit={this.onShuffleEdit}/>
      </div>);

    return (
      <div onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}
        >

        <ItemLabel label="Check all that apply" editMode={this.props.editMode}
          onClick={() => this.props.onRemove(this.props.itemModel, this.props.partModel)}/>
       
        <Collapse caption="Choices" expanded={expanded}>
          {this.renderChoices()}
        </Collapse>

        <TabularFeedback
            {...this.props}
            model={this.props.partModel}
            onEdit={this.onPartEdit}
          />
        <Hints
            {...this.props}
            model={this.props.partModel}
            onEdit={this.onPartEdit}
          />
        <ExplanationEditor
            {...this.props}
            model={this.props.partModel.explanation}
            onEdit={this.onExplanation}
          />
      </div>);
  }

}

