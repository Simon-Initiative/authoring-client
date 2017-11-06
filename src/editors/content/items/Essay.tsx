import * as React from 'react';
import * as contentTypes from 'app/data/contentTypes';
import { AppServices } from '../../common/AppServices';
import {
  AbstractItemPartEditor,
  AbstractItemPartEditorProps,
} from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { ItemLabel } from './ItemLabel';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from 'app/utils/guid';
import ConceptsEditor from '../concepts/ConceptsEditor.controller';
import '../common/editor.scss';
import './MultipleChoice.scss';

export interface Essay {}

export interface EssayProps extends AbstractItemPartEditorProps<contentTypes.Essay> {}

export interface EssayState {}

/**
 * The content editor for HtmlContent.
 */
export class Essay
  extends AbstractItemPartEditor<contentTypes.Essay, EssayProps, EssayState> {

  constructor(props) {
    super(props);

    this.onPartEdit = this.onPartEdit.bind(this);
    this.onExplanation = this.onExplanation.bind(this);

    this.onCriteriaAdd = this.onCriteriaAdd.bind(this);
    this.onCriteriaRemove = this.onCriteriaRemove.bind(this);
    this.onCriteriaEdit = this.onCriteriaEdit.bind(this);

    this.onConceptsEdit = this.onConceptsEdit.bind(this);
  }

  onExplanation(explanation) {
    const part = this.props.partModel.with({ explanation });
    this.props.onEdit(this.props.itemModel, part);
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
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

  onConceptsEdit(concepts) {
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ concepts }));
  }


  renderCriteria() {
    const expandedCriteria =
      <form className="form-inline">
        <Button editMode={this.props.editMode}
          onClick={this.onCriteriaAdd}>Add Grading Criteria</Button>
      </form>;

    return (
      <Collapse caption="Grading Criteria"
        details=""
        expanded={expandedCriteria}>

          {this.props.partModel.criteria.toArray()
            .map(c => <CriteriaEditor
              onRemove={this.onCriteriaRemove}
              model={c}
              onEdit={this.onCriteriaEdit}
              context={this.props.context}
              services={this.props.services}
              editMode={this.props.editMode} />,
            )
          }
        </Collapse>
    );
  }


  render() : JSX.Element {
    return (
      <div onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}>
        <ItemLabel label="Essay"
          editMode={this.props.editMode}
          onClick={() => this.props.onRemove(this.props.itemModel, this.props.partModel)}/>

          <ConceptsEditor
            editMode={this.props.editMode}
            services={this.props.services}
            context={this.props.context}
            courseId={this.props.context.courseId}
            model={this.props.partModel.concepts}
            onEdit={this.onConceptsEdit}
            title="Skills"
            conceptType="skill" />

        {this.renderCriteria()}

        <Hints
          {...this.props}
          model={this.props.partModel}
          onEdit={this.onPartEdit} />
        <ExplanationEditor
            {...this.props}
            model={this.props.partModel.explanation}
            onEdit={this.onExplanation} />
      </div>
    );
  }

}

