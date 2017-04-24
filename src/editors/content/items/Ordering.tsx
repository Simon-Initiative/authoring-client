'use strict'

import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { TextInput, InlineForm, InputLabel, Button, Checkbox, Collapse } from '../common/controls';
import guid from '../../../utils/guid';

import '../common/editor.scss';
import './MultipleChoice.scss';

type IdTypes = {
  shuffle: string
}

export interface Ordering {
  ids: IdTypes;
}

export interface OrderingProps extends AbstractItemPartEditorProps<contentTypes.Ordering> {

}

export interface OrderingState {

}

/**
 * The content editor for HtmlContent.
 */
export class Ordering 
  extends AbstractItemPartEditor<contentTypes.Ordering, OrderingProps, OrderingState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: []
    };
    this.ids = {
      shuffle: guid()
    }
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onShuffleChange = this.onShuffleChange.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onExplanation = this.onExplanation.bind(this);
  }

  onExplanation(explanation) {
    const part = this.props.partModel.with({explanation});
    this.props.onEdit(this.props.itemModel, part);
  }

  onShuffleChange(e) {
    this.props.onEdit(this.props.itemModel.with({shuffle: e.target.value}), this.props.partModel);
  }

  onAddChoice() {
    const choice = new contentTypes.Choice({});
    
    let itemModel = this.props.itemModel.with({choices: this.props.itemModel.choices.set(choice.guid, choice) });
    
    this.props.onEdit(itemModel, this.props.partModel);
  }

  onChoiceEdit(c) {
    this.props.onEdit(this.props.itemModel.with({choices: this.props.itemModel.choices.set(c.guid, c) }), this.props.partModel);
  }

  toLetter(index) {
    return String.fromCharCode(65 + index);
  }

  renderChoice(choice: contentTypes.Choice, index: number) {
    return <Choice 
              key={choice.guid}
              label={'Choice ' + this.toLetter(index)}
              {...this.props}
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

  onRemoveChoice(choice: contentTypes.Choice) {
    let itemModel = this.props.itemModel.with({choices: this.props.itemModel.choices.delete(choice.guid) });
    let partModel = this.updateChoiceReferences(choice.value, this.props.partModel);

    this.props.onEdit(itemModel, partModel);
  }

  onShuffleEdit(shuffle: boolean) {
    const itemModel = this.props.itemModel.with({shuffle});
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
      borderColor: '#AAAAAA'
    }

    const expanded = (
      <div style={{display: 'inline'}}>
        <Button type='link' onClick={this.onAddChoice}>Add Choice</Button>
        <Checkbox label='Shuffle' value={this.props.itemModel.shuffle} onEdit={this.onShuffleEdit}/>
      </div>);

    return (
      <div onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}
        >
        <Collapse caption='Choices' expanded={expanded}>
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

