import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { CriteriaEditor } from '../question/CriteriaEditor';
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
    this.onSizeChange = this.onSizeChange.bind(this);
    this.onExplanation = this.onExplanation.bind(this);

    this.onCriteriaAdd = this.onCriteriaAdd.bind(this);
    this.onCriteriaRemove = this.onCriteriaRemove.bind(this);
    this.onCriteriaEdit = this.onCriteriaEdit.bind(this);
  }

  onExplanation(explanation) {
    const part = this.props.partModel.with({explanation});
    this.props.onEdit(this.props.itemModel, part);
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  renderCriteria() {
    const expandedCriteria =
      <form className="form-inline">
        <Button editMode={this.props.editMode} 
          onClick={this.onCriteriaAdd}>Add Grading Criteria</Button>
      </form>;

    return <Collapse caption="Grading Criteria" 
        details=""
        expanded={expandedCriteria}>

          {this.props.partModel.criteria.toArray()
            .map(c => <CriteriaEditor
              onRemove={this.onCriteriaRemove}
              model={c}
              onEdit={this.onCriteriaEdit}
              context={this.props.context}
              services={this.props.services}
              editMode={this.props.editMode}
              />)}

      </Collapse>;

  }

  onWhitespaceChange(whitespace) {
    this.props.onEdit(this.props.itemModel.with({ whitespace }), this.props.partModel);
  }

  onCaseSensitive(caseSensitive) {
    this.props.onEdit(this.props.itemModel.with({ caseSensitive }), this.props.partModel);
  }


  onCriteriaAdd() {
    const c = new contentTypes.GradingCriteria();
    const criteria = this.props.partModel.criteria.set(c.guid, c);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }));
  }
  onCriteriaRemove(guid) {
    const criteria = this.props.partModel.criteria.delete(guid);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }));
  }
  onCriteriaEdit(c) {
    const criteria = this.props.partModel.criteria.set(c.guid, c);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }));
  }


  onSizeChange(inputSize) {
    this.props.onEdit(this.props.itemModel.with({ inputSize }), this.props.partModel);
  }

  render() : JSX.Element {
    
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

        <ItemLabel label='Short Answer' editMode={this.props.editMode}
          onClick={() => this.props.onRemove(this.props.itemModel, this.props.partModel)}/>
        
        {controls}

        {this.renderCriteria()}

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

