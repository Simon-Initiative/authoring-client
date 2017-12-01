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
import ConceptsEditor from '../concepts/ConceptsEditor';
import { TextInput, InlineForm, Button, Checkbox, Collapse } from '../common/controls';
import guid from 'utils/guid';
import { Question, QuestionProps, QuestionState,
 Section, SectionContent, SectionControl, SectionHeader } from './Question';

export interface MultipleChoiceProps
  extends QuestionProps<contentTypes.MultipleChoice> {

}

export interface MultipleChoiceState
  extends QuestionState {

  }

// tslint:disable-next-line
const ChoiceFeedback = (props) => {
  return (
    <div className="choice-feedback clearfix">
      {props.children}
    </div>
  );
};

/**
 * The content editor for HtmlContent.
 */
export class MultipleChoice
  extends Question<MultipleChoiceProps, MultipleChoiceState> {

  constructor(props) {
    super(props);

    this.setClassname('multiple-choice');

    this.onAddChoice = this.onAddChoice.bind(this);
    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
  }

  onToggleShuffle(e) {
    this.props.onEdit(this.props.itemModel.with({ shuffle: e.target.value }), this.props.partModel);
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
      { responses: this.props.partModel.responses.set(updated.guid, updated) },
    );
    this.props.onEdit(this.props.itemModel, partModel);
  }

  renderFeedback(
    choice: contentTypes.Choice,
    response : contentTypes.Response,
    feedback: contentTypes.Feedback,
  ) {
    return (
      <FeedbackEditor
        key={feedback.guid}
        context={this.props.context}
        services={this.props.services}
        editMode={this.props.editMode}
        showLabel={true}
        model={feedback}
        onRemove={this.onRemoveChoice.bind(this, choice, response)}
        onEdit={this.onFeedbackEdit.bind(this, response)} />
    );
  }

  onRemoveChoice(choice, response) {
    const itemModel = this.props.itemModel.with(
      { choices: this.props.itemModel.choices.delete(choice.guid) });
    const partModel = this.props.partModel.with(
      { responses: this.props.partModel.responses.delete(response.guid) });

    this.props.onEdit(itemModel, partModel);
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

  renderAdditionalSections() {
    const { editMode, itemModel, partModel } = this.props;

    return ([
      <Section key="choices" name="choices">
        <SectionHeader title="Choices">
          <SectionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
            <input
              className="toggle toggle-light"
              type="checkbox"
              checked={itemModel.shuffle} />
            <label className="toggle-btn"></label>
          </SectionControl>
        </SectionHeader>
        <SectionContent>
          <Button
            editMode={editMode}
            type="link"
            onClick={this.onAddChoice}>
            Add Choice
          </Button>
          {this.renderChoices()}
        </SectionContent>
      </Section>,
    ]);
  }
}
