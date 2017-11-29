import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor,
  AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { CriteriaEditor } from '../question/CriteriaEditor';
import ConceptsEditor from '../concepts/ConceptsEditor.controller';
import { TextInput, InlineForm, InputLabel, Button, Checkbox, Collapse } from '../common/controls';
import { ItemLabel } from './ItemLabel';
import guid from '../../../utils/guid';

type IdTypes = {
  shuffle: string,
};

export interface OrderingProps extends AbstractItemPartEditorProps<contentTypes.Ordering> {
  hideGradingCriteria: boolean;
}

export interface OrderingState {

}

/**
 * The content editor for HtmlContent.
 */
export class Ordering
  extends AbstractItemPartEditor<contentTypes.Ordering, OrderingProps, OrderingState> {
  ids: IdTypes;

  constructor(props) {
    super(props);

    this.state = {
      editHistory: [],
    };
    this.ids = {
      shuffle: guid(),
    };
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onShuffleChange = this.onShuffleChange.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
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

  onShuffleChange(e) {
    this.props.onEdit(this.props.itemModel.with({ shuffle: e.target.value }), this.props.partModel);
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

  onAddChoice() {

    const count = this.props.itemModel.choices.size;
    const value = this.toLetter(count);

    const choice = new contentTypes.Choice().with({ value, guid: guid() });

    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(choice.guid, choice) });

    this.props.onEdit(itemModel, this.props.partModel);
  }

  onChoiceEdit(c) {
    this.props.onEdit(
      this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(c.guid, c) }),
      this.props.partModel);
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


  toLetter(index) {
    return String.fromCharCode(65 + index);
  }

  renderChoice(choice: contentTypes.Choice, index: number) {
    return <Choice
              key={choice.guid}
              label={'Choice ' + this.toLetter(index)}
              context={this.props.context}
              services={this.props.services}
              editMode={this.props.editMode}
              model={choice}
              onEdit={this.onChoiceEdit}
              onRemove={this.onRemoveChoice.bind(this, choice)}
              />;
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  updateChoiceReferences(removedValue, partModel: contentTypes.Part) : contentTypes.Part {

    // For each response, adjust matches that may have
    // utilized the removedValue...

    return partModel;
  }

  updateChoiceValues(itemModel: contentTypes.Ordering) : contentTypes.Ordering {

    const choices = itemModel.choices.toArray();
    let newChoices = Immutable.OrderedMap<string, contentTypes.Choice>();

    choices.forEach((choice, index) => {
      const value = this.toLetter(index);
      const updated = choice.with({ value });
      newChoices = newChoices.set(updated.guid, updated);
    });

    return itemModel.with({ choices: newChoices });
  }

  onRemoveChoice(choice: contentTypes.Choice) {
    let itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });

    itemModel = this.updateChoiceValues(itemModel);
    const partModel = this.updateChoiceReferences(choice.value, this.props.partModel);

    this.props.onEdit(itemModel, partModel);
  }

  onShuffleEdit(shuffle: boolean) {
    const itemModel = this.props.itemModel.with({ shuffle });
    this.props.onEdit(itemModel, this.props.partModel);
  }

  renderChoices() {
    return this.props.itemModel.choices
      .toArray()
      .map((c, i) => this.renderChoice(c, i));
  }

  onConceptsEdit(concepts) {
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ concepts }));
  }

  render() : JSX.Element {

    const bodyStyle = {
      minHeight: '75px',
      borderStyle: 'solid',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    const expanded = (
      <div style={ { display: 'inline' } }>
        <Button editMode={this.props.editMode}
          type="link" onClick={this.onAddChoice}>Add Choice</Button>
        <Checkbox editMode={this.props.editMode}
          label="Shuffle" value={this.props.itemModel.shuffle} onEdit={this.onShuffleEdit}/>
      </div>);

    return (
      <div onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}
        >

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

        {!this.props.hideGradingCriteria && this.renderCriteria()}

        <Collapse caption="Choices" expanded={expanded}>
          {this.renderChoices()}
        </Collapse>

        <TabularFeedback
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            model={this.props.partModel}
            onEdit={this.onPartEdit}
          />
        <Hints
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            model={this.props.partModel}
            onEdit={this.onPartEdit}
          />
        <ExplanationEditor
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            model={this.props.partModel.explanation}
            onEdit={this.onExplanation}
          />
      </div>);
  }

}

