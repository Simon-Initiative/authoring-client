'use strict'

import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';
import { ResponseMultEditor } from './ResponseMult';
import '../common/editor.scss';
import './MultipleChoice.scss';


export interface Text {
  
}

export interface TextProps extends AbstractItemPartEditorProps<contentTypes.Text> {

}

export interface TextState {

}


/**
 * The content editor for HtmlContent.
 */
export class Text 
  extends AbstractItemPartEditor<contentTypes.Text, TextProps, TextState> {
    
  constructor(props) {
    super(props);
    
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onWhitespaceChange = this.onWhitespaceChange.bind(this);
    this.onCaseSensitive = this.onCaseSensitive.bind(this);
    this.onExplanation = this.onExplanation.bind(this);
  }

  onExplanation(explanation) {
    const part = this.props.partModel.with({explanation});
    this.props.onEdit(this.props.itemModel, part);
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  onWhitespaceChange(whitespace) {
    this.props.onEdit(this.props.itemModel.with({ whitespace }), this.props.partModel);
  }

  onCaseSensitive(caseSensitive) {
    this.props.onEdit(this.props.itemModel.with({ caseSensitive }), this.props.partModel);
  }

  onSizeChange(inputSize) {
    this.props.onEdit(this.props.itemModel.with({ inputSize }), this.props.partModel);
  }

  onEditMult(mult) {
    const responseMult = this.props.partModel.responseMult.set(mult.guid, mult);
    const partModel = this.props.partModel.with({ responseMult });
    this.props.onEdit(this.props.itemModel, partModel);
  }

  render() : JSX.Element {
    
    let feedback;

    if (this.props.partModel.responseMult.size > 0) {

      feedback = this.props.partModel.responseMult
        .toArray().map(m => <ResponseMultEditor
          editMode={this.props.editMode}
          services={this.props.services}
          context={this.props.context}
          model={m}
          onEdit={this.onEditMult.bind(this)}
        />);
    } else {
      
      feedback = <TabularFeedback
            editMode={this.props.editMode}
            services={this.props.services}
            context={this.props.context}
            model={this.props.partModel}
            onEdit={this.onPartEdit}
          />;
    } 


    const controls = (
      <div style={{display: 'inline'}}>
        <Select editMode={this.props.editMode}
          label='Whitespace' value={this.props.itemModel.whitespace} onChange={this.onWhitespaceChange}>
          <option value="preserve">Preserve</option>
          <option value="trim">Trim</option>
          <option value="normalize">Normalize</option>
        </Select>
        <Select editMode={this.props.editMode}
          label='Size' value={this.props.itemModel.inputSize} onChange={this.onSizeChange}>
          <option value="small">small</option>
          <option value="medium">medium</option>
          <option value="large">large</option>
        </Select>
        
        <Checkbox editMode={this.props.editMode}
          label='Case Sensitive' value={this.props.itemModel.caseSensitive} onEdit={this.onCaseSensitive}/>
      </div>);

    return (
      <div onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}
        >

        <ItemLabel label='Text' editMode={this.props.editMode}
          onClick={() => this.props.onRemove(this.props.itemModel, this.props.partModel)}/>

        {controls}

        <Hints
            {...this.props}
            model={this.props.partModel}
            onEdit={this.onPartEdit}
          />
        
        {feedback}

        <ExplanationEditor
            {...this.props}
            model={this.props.partModel.explanation}
            onEdit={this.onExplanation}
          />
        
      </div>);
  }

}

