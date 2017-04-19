'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Concept } from './Concept';
import { SkillSelection } from '../../../utils/selection/SkillSelection';
import { Collapse } from '../common/Collapse';

export interface ConceptsEditor {

}

export interface ConceptsEditorProps extends AbstractContentEditorProps<Immutable.List<string>> {
  conceptType: string;

  title: string;
}

export interface ConceptstEditorState {

}

/**
 * Concepts editor 
 */
export class ConceptsEditor extends AbstractContentEditor<Immutable.List<string>, ConceptsEditorProps, ConceptstEditorState> {

  constructor(props) {
    super(props);

    this.onRemove = this.onRemove.bind(this);
    this.onAddConcept = this.onAddConcept.bind(this);
  }

  onRemove(id: string, type: string) {
    return this.props.onEdit(this.props.model.filter((v) => v !== id).toList());
  }

  renderConcepts() {
    return this.props.model.toArray()
      .map(c => <Concept key={c} titleOracle={this.props.titleOracle} conceptId={c} conceptType={this.props.conceptType} onRemove={this.onRemove}/>)
  }

  render() : JSX.Element {
    return (
      <Collapse caption='Skills' details='Expand to add/remove skills'>
        <div className="card">
          <div className="card-block">
            {this.renderConcepts()}
          </div>
        </div>
        <button onClick={this.onAddConcept} type="button" className="btn btn-sm btn-primary">Add Skill</button>
          
      </Collapse>);
  
  }

  onAddConcept() {
    this.props.services.displayModal(
        <SkillSelection
          onInsert={(item) => {
            this.props.services.dismissModal();
            return this.props.onEdit(this.props.model.push(item.id));   
          }} 
          onCancel={() => {
            this.props.services.dismissModal();  
          }}/>
    );
  }

}

