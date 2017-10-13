'use strict'

import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';
import { ResponseMultEditor } from './ResponseMult';
import { ConceptsEditor } from '../concepts/ConceptsEditor';
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

    this.onCriteriaAdd = this.onCriteriaAdd.bind(this);
    this.onCriteriaRemove = this.onCriteriaRemove.bind(this);
    this.onCriteriaEdit = this.onCriteriaEdit.bind(this);

    this.onConceptsEdit = this.onConceptsEdit.bind(this);
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

  onNotationChange(notation) {
    this.props.onEdit(this.props.itemModel.with({ notation }), this.props.partModel);
  }

  onEditMult(mult) {
    const responseMult = this.props.partModel.responseMult.set(mult.guid, mult);
    const partModel = this.props.partModel.with({ responseMult });
    this.props.onEdit(this.props.itemModel, partModel);
  }

  onConceptsEdit(concepts) {
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ concepts }));
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
            input={this.props.itemModel.id}
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
          label='Size' value={this.props.itemModel.inputSize} onChange={this.onSizeChange}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
        <Select editMode={this.props.editMode}
          label='Notation' value={this.props.itemModel.notation} onChange={this.onNotationChange}>
          <option value="automatic">Automatic</option>
          <option value="decimal">Decimal</option>
          <option value="scientific">Scientific</option>
        </Select>
      </div>);

    return (
      <div 
        className="itemPart"
        onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}
        >

        <ItemLabel label='Numeric' editMode={this.props.editMode}
          onClick={() => this.props.onRemove(this.props.itemModel, this.props.partModel)}/>
        
        {controls}

        <ConceptsEditor 
          editMode={this.props.editMode}
          services={this.props.services}
          context={this.props.context}
          courseId={this.props.context.courseId}
          model={this.props.partModel.concepts}
          onEdit={this.onConceptsEdit} 
          title="Skills"
          conceptType="skill"
          />


        {this.renderCriteria()}

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

