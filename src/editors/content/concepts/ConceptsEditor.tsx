'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Concept } from './Concept';
import { SkillSelection } from '../../../utils/selection/SkillSelection';
import { Collapse } from '../common/Collapse';
import { TextInput, InlineForm, Button, Checkbox } from '../common/controls';

export interface ConceptsEditor {

}

export interface ConceptsEditorProps extends AbstractContentEditorProps<Immutable.List<string>> {
  conceptType: string;

  title: string;
}

export interface ConceptstEditorState {

}


const Spacer = (props) => <span>&nbsp;&nbsp;</span>; // There is probably a better way...


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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  renderConcepts() {
    return this.props.model.toArray()
      .map(c => <Concept key={'concept' + c} titleOracle={this.props.services.titleOracle} conceptId={c} conceptType={this.props.conceptType} onRemove={this.onRemove}/>)
      .map((c, i) => [c, <Spacer key={i}/>])
      .reduce((p, c) => p.concat(c), []);
  }

  render() : JSX.Element {

    const expanded = (
      <InlineForm position='right'>
        <Button onClick={this.onAddConcept}>Add Skill</Button>
      </InlineForm>
    );

    return (
      <Collapse caption='Skills' details='Expand to add/remove skills' expanded={expanded}>
        <div className='ConceptWell'>
          {this.renderConcepts()}
        </div>
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

