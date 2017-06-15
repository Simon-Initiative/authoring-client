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
  courseId: string;
  title: string;
}

export interface ConceptstEditorState {

}

/* tslint:disable */
const Spacer = props => <span>&nbsp;&nbsp;</span>; // There is probably a better way...
/* tslint:enable */

/**
 * Concepts editor 
 */
export class ConceptsEditor 
  extends AbstractContentEditor<Immutable.List<string>, ConceptsEditorProps, ConceptstEditorState> {

  constructor(props) {
    super(props);

    this.onRemove = this.onRemove.bind(this);
    this.onAddConcept = this.onAddConcept.bind(this);
  }

  onRemove(id: string, type: string) {
    return this.props.onEdit(this.props.model.filter(v => v !== id).toList());
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  renderConcepts() {
    return this.props.model.toArray()
      .map(c => <Concept key={'concept' + c} 
         courseId={this.props.context.courseId}
         editMode={this.props.editMode}
         titleOracle={this.props.services.titleOracle} 
         conceptId={c} conceptType={this.props.conceptType} 
         onRemove={this.onRemove}/>)
      .map((c, i) => [c, <Spacer key={i}/>])
      .reduce((p, c) => p.concat(c), []);
  }

  render() : JSX.Element {

    const expanded = 
        <Button editMode={this.props.editMode} 
          type="link" onClick={this.onAddConcept}>Add Skill</Button>;

    return (
      <Collapse caption="Skills" expanded={expanded}>
        <div className="ConceptWell">
          {this.renderConcepts()}
        </div>
      </Collapse>);
  
  }

  onAddConcept() {
    this.props.services.displayModal(
        <SkillSelection
          titleOracle={this.props.services.titleOracle} 
          courseId={this.props.courseId}
          onInsert={(item) => {
            this.props.services.dismissModal();
            return this.props.onEdit(this.props.model.push(item.id));   
          }} 
          onCancel={() => {
            this.props.services.dismissModal();  
          }}/>,
    );
  }

}

