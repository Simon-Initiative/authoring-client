import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractItemPartEditor,
  AbstractItemPartEditorProps,
  AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { FeedbackEditor } from '../part/FeedbackEditor';
import { ItemLabel } from './ItemLabel';
import { TextInput, InlineForm, Button } from '../common/controls';
import guid from 'utils/guid';
import { ResponseMultEditor } from './ResponseMult';
import { Section, SectionHeader, SectionContent, SectionControl } from './Question';

export interface FillInTheBlankProps
  extends AbstractItemPartEditorProps<contentTypes.FillInTheBlank> {

}

export interface FillInTheBlankState extends AbstractItemPartEditorState {

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
  extends AbstractItemPartEditor<contentTypes.FillInTheBlank,
    FillInTheBlankProps, FillInTheBlankState> {

  constructor(props) {
    super(props);

    this.onFeedbackEdit = this.onFeedbackEdit.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onEditMult = this.onEditMult.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const updated = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    const part = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) },
    );
    onEdit(itemModel, part);
  }

  renderFeedback(
    choice: contentTypes.Choice,
    response : contentTypes.Response, feedback: contentTypes.Feedback) {
    const {
      context,
      services,
      editMode,
    } = this.props;

    return (
      <FeedbackEditor
        key={feedback.guid}
        context={context}
        services={services}
        editMode={editMode}
        model={feedback}
        showLabel={true}
        onRemove={this.onRemoveChoice.bind(this, choice, response)}
        onEdit={this.onFeedbackEdit.bind(this, response)} />
    );
  }

  onAddChoice() {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const value = guid().replace('-', '');
    const match = value;
    const choice = new contentTypes.Choice().with({ value });
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response().with({ match, input: itemModel.id });
    response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });

    const newItemModel = itemModel.with(
      { choices: itemModel.choices.set(choice.guid, choice) });
    const newPartModel = partModel.with(
      { responses: partModel.responses.set(response.guid, response) });

    onEdit(newItemModel, newPartModel);
  }

  onRemoveChoice(choice, response) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const newItemModel = itemModel.with(
      { choices: itemModel.choices.delete(choice.guid) });
    const newPartModel = partModel.with(
      { responses: partModel.responses.delete(response.guid) });

    onEdit(newItemModel, newPartModel);
  }

  onChoiceEdit(c) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(
      itemModel.with(
      { choices: itemModel.choices.set(c.guid, c) }),
      partModel);
  }

  onToggleShuffle(e) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ shuffle: e.target.value }), partModel);
  }

  onEditMult(mult) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const responseMult = partModel.responseMult.set(mult.guid, mult);
    const newPartModel = partModel.with({ responseMult });
    onEdit(itemModel, newPartModel);
  }

  renderChoice(choice: contentTypes.Choice, response : contentTypes.Response) {
    const {
      context,
      services,
      editMode,
    } = this.props;

    return (
      <Choice
        key={choice.guid}
        context={context}
        services={services}
        editMode={editMode}
        model={choice}
        onEdit={this.onChoiceEdit}
        onRemove={() => this.onRemoveChoice(choice, response)} />
    );
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const updated = response.with({ score });
    const newPartModel = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) });
    onEdit(itemModel, newPartModel);
  }

  renderChoices() {
    const {
      editMode,
      services,
      context,
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const responses = partModel.responses.toArray();
    const mult = partModel.responseMult.toArray();
    const choices = itemModel.choices.toArray();

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
            editMode={editMode}
            services={services}
            context={context}
            model={m}
            onEdit={this.onEditMult}
          />);
      }

      if (responses.length > i) {
        rendered.push(
          <ChoiceFeedback key={c.guid}>
            {this.renderChoice(c, responses[i])}
            {renderedFeedback}
            <InlineForm position="right">
              <TextInput editMode={editMode}
                label="Score" value={responses[i].score} type="number" width="75px"
                onEdit={this.onScoreEdit.bind(this, responses[i])}/>
            </InlineForm>
          </ChoiceFeedback>,
        );
      }
    }

    return rendered;
  }

  render() {
    const {
      editMode,
      itemModel,
    } = this.props;

    return (
      <Section name="choices">
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
          <div style={ { display: 'inline' } }>
            <Button editMode={editMode}
              type="link" onClick={this.onAddChoice}>Add Choice</Button>
          </div>
          {this.renderChoices()}
        </SectionContent>
      </Section>
    );
  }
}
