import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { AppServices } from '../../common/AppServices';
import {
  AbstractItemPartEditor,
  AbstractItemPartEditorProps,
} from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { FeedbackEditor } from '../part/FeedbackEditor';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { TextInput, InlineForm, Button, Checkbox, Collapse } from '../common/controls';
import guid from 'utils/guid';
import { ResponseMultEditor } from './ResponseMult';
import ConceptsEditor from '../concepts/ConceptsEditor.controller';
import {
  MultipartInput, MultipartInputProps, Section,
  SectionHeader, SectionContent,
} from './MultipartInput';

export interface FillInTheBlankProps extends MultipartInputProps {

}

export interface FillInTheBlankState {

}

const ChoiceFeedback = (props) => {
  return (
    <div className="choice-feedback clearfix">
      {props.children}
    </div>
  );
};

/**
 * FillInTheBlank Question Editor
 */
export class FillInTheBlank
  extends MultipartInput {

  constructor(props) {
    super(props);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback) {
    const updated = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    const part = this.props.partModel.with(
      { responses: this.props.partModel.responses.set(updated.guid, updated) },
    );
    this.props.onEdit(this.props.itemModel, part);
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
        model={feedback}
        showLabel={true}
        onRemove={this.onRemoveChoice.bind(this, choice, response)}
        onEdit={this.onFeedbackEdit.bind(this, response)} />
    );
  }

  onAddChoice() {
    const value = guid().replace('-', '');
    const match = value;
    const choice = new contentTypes.Choice().with({ value });
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response().with({ match, input: this.props.itemModel.id });
    response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });

    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(choice.guid, choice) });
    const partModel = this.props.partModel.with(
      { responses: this.props.partModel.responses.set(response.guid, response) });

    this.props.onEdit(itemModel, partModel);
  }

  onRemoveChoice(choice, response) {
    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });
    const partModel = this.props.partModel.with(
      { responses: this.props.partModel.responses.delete(response.guid) });

    this.props.onEdit(itemModel, partModel);
  }

  onChoiceEdit(c) {
    this.props.onEdit(
      this.props.itemModel.with(
      { choices: this.props.itemModel.choices.set(c.guid, c) }),
      this.props.partModel);
  }


  onShuffleEdit(shuffle: boolean) {
    const itemModel = this.props.itemModel.with({ shuffle });
    this.props.onEdit(itemModel, this.props.partModel);
  }

  onEditMult(mult) {
    const responseMult = this.props.partModel.responseMult.set(mult.guid, mult);
    const partModel = this.props.partModel.with({ responseMult });
    this.props.onEdit(this.props.itemModel, partModel);
  }

  renderChoice(choice: contentTypes.Choice, response : contentTypes.Response) {
    return (
      <Choice
        key={choice.guid}
        context={this.props.context}
        services={this.props.services}
        editMode={this.props.editMode}
        model={choice}
        onEdit={this.onChoiceEdit}
        onRemove={this.onRemoveChoice.bind(this, choice, response)} />
    );
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const updated = response.with({ score });
    const partModel = this.props.partModel.with(
      { responses: this.props.partModel.responses.set(updated.guid, updated) });
    this.props.onEdit(this.props.itemModel, partModel);
  }

  renderChoices() {
    const responses = this.props.partModel.responses.toArray();
    const mult = this.props.partModel.responseMult.toArray();
    const choices = this.props.itemModel.choices.toArray();

    const rendered = [];

    for (let i = 0; i < choices.length; i += 1) {
      const c = choices[i];

      let renderedFeedback = null;

      if (responses.length > i) {
        if (responses[i].feedback.size > 0) {
          const f = responses[i].feedback.first();
          renderedFeedback = this.renderFeedback(c, responses[i], f);
        }
      } else if (mult.length > 0) {
        renderedFeedback = mult.map(m => <ResponseMultEditor
            editMode={this.props.editMode}
            services={this.props.services}
            context={this.props.context}
            model={m}
            onEdit={this.onEditMult.bind(this)}
          />);
      }

      if (responses.length > i) {
        rendered.push(
          <ChoiceFeedback key={c.guid}>
            {this.renderChoice(c, responses[i])}
            {renderedFeedback}
            <InlineForm position="right">
              <TextInput editMode={this.props.editMode}
                label="Score" value={responses[i].score} type="number" width="75px"
                onEdit={this.onScoreEdit.bind(this, responses[i])}/>
            </InlineForm>
          </ChoiceFeedback>,
        );
      }
    }

    return rendered;
  }

  renderAdditionalSections() {
    return ([
      <Section name="choices">
        <SectionHeader name="Choices"/>
        <SectionContent>
          <div style={ { display: 'inline' } }>
            <Button editMode={this.props.editMode}
              type="link" onClick={this.onAddChoice}>Add Choice</Button>
            <Checkbox editMode={this.props.editMode}
              label="Shuffle" value={this.props.itemModel.shuffle} onEdit={this.onShuffleEdit}/>
          </div>
          {this.renderChoices()}
        </SectionContent>
      </Section>,
    ]);
  }
}
