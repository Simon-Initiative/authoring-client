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


export interface ShortAnswer {
  
}

export interface ShortAnswerProps extends AbstractItemPartEditorProps<contentTypes.ShortAnswer> {

}

export interface ShortAnswerState {

}


/**
 * The content editor for HtmlContent.
 */
export class ShortAnswer 
  extends AbstractItemPartEditor<contentTypes.ShortAnswer, ShortAnswerProps, ShortAnswerState> {
    
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

  render() : JSX.Element {
    
    const controls = (
      <div style={{display: 'inline'}}>
        <Select label='Whitespace' value={this.props.itemModel.whitespace} onChange={this.onWhitespaceChange}>
          <option value="preserve">Preserve</option>
          <option value="trim">Trim</option>
          <option value="normalize">Normalize</option>
        </Select>
        <Select label='Size' value={this.props.itemModel.inputSize} onChange={this.onSizeChange}>
          <option value="small">small</option>
          <option value="medium">medium</option>
          <option value="large">large</option>
        </Select>
        
        <Checkbox label='Case Sensitive' value={this.props.itemModel.caseSensitive} onEdit={this.onCaseSensitive}/>
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
        <ExplanationEditor
            {...this.props}
            model={this.props.partModel.explanation}
            onEdit={this.onExplanation}
          />
        
      </div>);
  }

}

