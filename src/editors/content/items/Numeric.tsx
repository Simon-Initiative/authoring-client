'use strict'

import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';

import '../common/editor.scss';
import './MultipleChoice.scss';


export interface Numeric {
  
}

export interface NumericProps extends AbstractItemPartEditorProps<contentTypes.Numeric> {

}

export interface NumericState {

}


/**
 * The content editor for HtmlContent.
 */
export class Numeric 
  extends AbstractItemPartEditor<contentTypes.Numeric, NumericProps, NumericState> {
    
  constructor(props) {
    super(props);
    
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onSizeChange = this.onSizeChange.bind(this);
    this.onNotationChange = this.onNotationChange.bind(this);
    this.onExplanation = this.onExplanation.bind(this);
  }

  onExplanation(explanation) {
    const part = this.props.partModel.with({explanation});
    this.props.onEdit(this.props.itemModel, part);
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  onSizeChange(inputSize) {
    this.props.onEdit(this.props.itemModel.with({ inputSize }), this.props.partModel);
  }

  onNotationChange(notation) {
    this.props.onEdit(this.props.itemModel.with({ notation }), this.props.partModel);
  }

  render() : JSX.Element {
    
    const controls = (
      <div style={{display: 'inline'}}>
        <Select label='Size' value={this.props.itemModel.inputSize} onChange={this.onSizeChange}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
        <Select label='Notation' value={this.props.itemModel.notation} onChange={this.onNotationChange}>
          <option value="automatic">Automatic</option>
          <option value="decimal">Decimal</option>
          <option value="scientific">Scientific</option>
        </Select>
      </div>);

    return (
      <div onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}
        >
        
        {controls}

        <Hints
            {...this.props}
            model={this.props.partModel}
            onEdit={this.onPartEdit}
          />
        <TabularFeedback
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

