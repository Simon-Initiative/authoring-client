import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, 
  AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';

import '../common/editor.scss';
import './MultipleChoice.scss';


export interface Essay {
  
}

export interface EssayProps extends AbstractItemPartEditorProps<contentTypes.Essay> {

}

export interface EssayState {

}


/**
 * The content editor for HtmlContent.
 */
export class Essay 
  extends AbstractItemPartEditor<contentTypes.Essay, EssayProps, EssayState> {
    
  constructor(props) {
    super(props);
    
    this.onPartEdit = this.onPartEdit.bind(this);
    this.onExplanation = this.onExplanation.bind(this);
  }

  onExplanation(explanation) {
    const part = this.props.partModel.with({explanation});
    this.props.onEdit(this.props.itemModel, part);
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  render() : JSX.Element {
    
    return (
      <div onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}
        >

        <ItemLabel label='Essay' 
          onClick={() => this.props.onRemove(this.props.itemModel, this.props.partModel)}/>
        
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

