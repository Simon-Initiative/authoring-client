import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, 
  AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { FeedbackEditor } from '../part/FeedbackEditor';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { TextInput, InlineForm, Button, Checkbox, Collapse } from '../common/controls';
import guid from '../../../utils/guid';

import '../common/editor.scss';
import './MultipleChoice.scss';

type IdTypes = {
  select: string,
  shuffle: string,
};

export interface MultipleChoice {
  ids: IdTypes;
}

export interface MultipleChoiceProps 
  extends AbstractItemPartEditorProps<contentTypes.MultipleChoice> {

}

export interface MultipleChoiceState {

}

// tslint:disable-next-line
const ChoiceFeedback = (props) => {
  return (
    <div className="ChoiceFeedback clearfix">
      {props.children}
    </div>
  );
};

/**
 * The content editor for HtmlContent.
 */
export class MultipleChoice 
  extends AbstractItemPartEditor<contentTypes.MultipleChoice, 
    MultipleChoiceProps, MultipleChoiceState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: [],
    };
    this.ids = {
      select: guid(),
      shuffle: guid(),
    };

    this.onAddChoice = this.onAddChoice.bind(this);
    this.onShuffleChange = this.onShuffleChange.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onHintsEdit = this.onHintsEdit.bind(this);
    this.onExplanation = this.onExplanation.bind(this);

    this.onCriteriaAdd = this.onCriteriaAdd.bind(this);
    this.onCriteriaRemove = this.onCriteriaRemove.bind(this);
    this.onCriteriaEdit = this.onCriteriaEdit.bind(this);
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
    const value = guid().replace('-', '');
    const match = value; 
    const choice = new contentTypes.Choice({ value });
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response({ match });
    response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });

    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(choice.guid, choice) });
    const partModel = this.props.partModel.with(
      { responses: this.props.partModel.responses.set(response.guid, response) });

    this.props.onEdit(itemModel, partModel);
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


  onChoiceEdit(c) {
    this.props.onEdit(
      this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(c.guid, c) }), 
      this.props.partModel);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback) {
    const updated = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    const part = this.props.partModel.with(
      { responses: this.props.partModel.responses.set(updated.guid, updated) });
    this.props.onEdit(this.props.itemModel, part);
  }

  renderChoice(choice: contentTypes.Choice, response : contentTypes.Response) {
    return <Choice 
              key={choice.guid}
              context={this.props.context}
              services={this.props.services}
              editMode={this.props.editMode}
              model={choice}
              onEdit={this.onChoiceEdit} 
              onRemove={this.onRemoveChoice.bind(this, choice, response)}
              />;
  }

  onHintsEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const updated = response.with({ score });
    const partModel = this.props.partModel.with(
      { responses: this.props.partModel.responses.set(updated.guid, updated) });
    this.props.onEdit(this.props.itemModel, partModel);
  }

  renderFeedback(
    choice: contentTypes.Choice, 
    response : contentTypes.Response, feedback: contentTypes.Feedback) {
    return (
      <FeedbackEditor 
        key={feedback.guid}
        context={this.props.context}
        services={this.props.services}
        editMode={this.props.editMode}
        showLabel={true}
        model={feedback}
        onRemove={this.onRemoveChoice.bind(this, choice, response)}
        onEdit={this.onFeedbackEdit.bind(this, response)} 
        />);
  }

  onRemoveChoice(choice, response) {
    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });
    const partModel = this.props.partModel.with(
      { responses: this.props.partModel.responses.delete(response.guid) });

    this.props.onEdit(itemModel, partModel);
  }

  onShuffleEdit(shuffle: boolean) {
    const itemModel = this.props.itemModel.with({ shuffle });
    this.props.onEdit(itemModel, this.props.partModel);
  }

  renderChoices() {

    const responses = this.props.partModel.responses.toArray();
    const choices = this.props.itemModel.choices.toArray();

    const rendered = [];

    for (let i = 0; i < choices.length; i += 1) {
      const c = choices[i];

      let renderedFeedback = null;
      let renderedScore = null;

      if (responses.length > i) {
        if (responses[i].feedback.size > 0) {
          const f = responses[i].feedback.first();
          renderedFeedback = this.renderFeedback(c, responses[i], f);

          renderedScore = <InlineForm position="right">
              <TextInput editMode={this.props.editMode}
                label="Score" value={responses[i].score} type="number" width="75px"
                onEdit={this.onScoreEdit.bind(this, responses[i])}/>
            </InlineForm>;
        }
      }
      
      rendered.push(
        <ChoiceFeedback key={c.guid}>
          {this.renderChoice(c, responses[i])}
          {renderedFeedback}
          {renderedScore}
        </ChoiceFeedback>);
    }

    return rendered;
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

        <ItemLabel label="Multiple Choice" editMode={this.props.editMode}
          onClick={() => this.props.onRemove(this.props.itemModel, this.props.partModel)}/>
       
        {this.renderCriteria()}

        <Collapse caption="Choices" expanded={expanded}>
          {this.renderChoices()}
        </Collapse>
        <Hints
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            model={this.props.partModel}
            onEdit={this.onHintsEdit}
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
