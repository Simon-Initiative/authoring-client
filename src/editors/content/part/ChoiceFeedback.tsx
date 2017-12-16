import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Button } from '../common/controls';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { Remove } from 'components/common/Remove';
import { convert } from 'utils/format';
import { Html } from 'data/content/html.ts';
import createGuid from 'utils/guid';
import {
  InputList, InputListItem, ItemOptions, ItemOption, ItemControl, ItemOptionFlex,
} from 'editors/content/common/InputList.tsx';
import { modelWithDefaultFeedback } from 'editors/content/part/defaultFeedbackGenerator.ts';

import './ChoiceFeedback.scss';

// This sets the limit for the number of choices to use the autogenerate
// feedback combinations feature. When exceeded, the editor will switch to
// the glob notation, but as a side effect, analyzing which choices were made
// will no longer be possible
const AUTOGEN_MAX_CHOICES = 10;

const HTML_CONTENT_EDITOR_STYLE = {
  minHeight: '20px',
  borderStyle: 'none',
  borderWith: 1,
  borderColor: '#AAAAAA',
};

export interface ChoiceFeedbackProps extends AbstractContentEditorProps<contentTypes.Part> {
  input?: string;
  choices: contentTypes.Choice[];
}

export interface ChoiceFeedbackState {

}

/**
 * The content editor for choice feedback.
 */
export abstract class ChoiceFeedback
  extends AbstractContentEditor<contentTypes.Part, ChoiceFeedbackProps, ChoiceFeedbackState> {

  constructor(props) {
    super(props);

    this.onResponseEdit = this.onResponseEdit.bind(this);
    this.onAddFeedback = this.onAddFeedback.bind(this);
    this.onResponseRemove = this.onResponseRemove.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onDefaultFeedbackEdit = this.onDefaultFeedbackEdit.bind(this);
    this.onEditMatchSelections = this.onEditMatchSelections.bind(this);
    this.getSelectedMatches = this.getSelectedMatches.bind(this);
  }

  onResponseEdit(response) {
    const model = this.props.model.with({
      responses: this.props.model.responses.set(response.guid, response),
    });
    this.props.onEdit(model);
  }

  onAddFeedback() {
    const feedback = new contentTypes.Feedback();
    const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

    let response = new contentTypes.Response({
      score: '0',
      match: '',
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    if (this.props.input !== undefined) {
      response = response.with({ input: this.props.input });
    }
    const model = this.props.model.with({
      responses: this.props.model.responses.set(response.guid, response),
    });
    this.props.onEdit(model);
  }

  onResponseRemove(response) {
    let { model } = this.props;

    model = model.with({
      responses: model.responses.delete(response.guid),
    });

    this.props.onEdit(model);
  }

  onScoreEdit(response, score) {
    const { model, onEdit } = this.props;

    onEdit(model.with({
      responses: model.responses.set(
        response.guid,
        model.responses.get(response.guid).with({ score }),
      ),
    }));
  }

  onBodyEdit(body, response) {
    let feedback = response.feedback.first();
    feedback = feedback.with({ body });

    const updatedResponse = response.with({
      feedback: response.feedback.set(feedback.guid, feedback),
    });

    this.onResponseEdit(updatedResponse);
  }

  onDefaultFeedbackEdit(body: Html, score: string) {
    const { model, choices, onEdit } = this.props;

    const updatedModel = modelWithDefaultFeedback(model, choices, body, score, AUTOGEN_MAX_CHOICES);
    onEdit(updatedModel);
  }

  onEditMatchSelections(responseId, choices, selected) {
    const { model, onEdit } = this.props;

    onEdit(model.with({
      responses: model.responses.set(
        responseId,
        model.responses.get(responseId).with({
          match: selected.map(id =>
            choices.find(c => c.guid === id).value,
          )
          .join(','),
        }),
      ),
    }));
  }

  getSelectedMatches(response, choices) {
    return response.match.split(',').map((m) => {
      const choice = choices.find(c => c.value === m);
      return choice && choice.guid;
    }).filter(s => s);
  }

  renderMaxChoicesMessage() {
    return (
      <div className="message flex-spacer">
        <div className="alert alert-warning">
          <strong>NOTE</strong>&nbsp;&nbsp;Providing more than {AUTOGEN_MAX_CHOICES} choices
          (Choice {convert.toAlphaNotation(AUTOGEN_MAX_CHOICES)}) for this question will prevent
          you from determining exact selections for All Other Choices.
        </div>
      </div>
    );
  }

  renderResponses() {
    const { choices, model, context, services, editMode, onEdit } = this.props;

    // get default feedback details
    let defaultFeedbackBody;
    let defaultFeedbackScore;
    const defaultResponseItem =
      this.props.model.responses.toArray().find(r => r.name && !!r.name.match(/^AUTOGEN.*/));
    if (defaultResponseItem) {
      defaultFeedbackBody = defaultResponseItem.feedback.first().body;
      defaultFeedbackScore = defaultResponseItem.score;
    } else {
      defaultFeedbackBody = new Html();
      defaultFeedbackScore = '0';
    }

    // this methods takes the list of responses, filters out the auto-generated feedback
    // elements and replaces them with a single psudo-feedback element which covers all
    // other combinations of choices. By chaining these methods and adding some renderOpts,
    // we can distinguish between real responses and the psuedo one and reuse the feedback
    // rendering code
    return this.props.model.responses.toArray()
      // filter out all auto generated responses (identified by AUTOGEN string in name field)
      .filter(r => !r.name || !r.name.match(/^AUTOGEN.*/))
      // add some metadata for smarter rendering along-side psudo-feedback element
      .map(r => ({
        guid: r.guid,
        isDefault: false,
        feedbackBody: r.feedback.first().body,
        onEdit: (body, item) => this.onBodyEdit(body, item),
        score: r.score,
        onScoreEdit: (response, value) => this.onScoreEdit(response, value),
        item: r,
      }))
      // add the psudo-feedback element for all other choices to render it last
      .concat([{
        guid: 'default-feedback',
        isDefault: true,
        feedbackBody: defaultFeedbackBody,
        onEdit: (body, item) => this.onDefaultFeedbackEdit(body, defaultFeedbackScore),
        score: defaultFeedbackScore,
        onScoreEdit: (response, value) => this.onDefaultFeedbackEdit(defaultFeedbackBody, value),
        item: undefined,
      }])
      // finally, render all response elements and the psudo-feedback element for all other choices
      .map((response, i) => (
        <InputListItem
          key={response.guid}
          className="response"
          id={response.guid}
          label={response.isDefault ? '' : `${i + 1}`}
          contentTitle={response.isDefault ? 'All Other Choices' : ''}
          context={context}
          services={services}
          editMode={editMode}
          body={response.feedbackBody}
          onEdit={body => response.onEdit(body, response.item)}
          onRemove={() => this.onResponseRemove(response.item)}
          options={
          <ItemOptions>
            {!response.isDefault
              ? (
                <ItemOption className="matches" label="Matching Choices" flex>
                  <Typeahead
                    multiple
                    bsSize="small"
                    onChange={selected =>
                      this.onEditMatchSelections(response.guid, choices, selected)}
                    options={choices.map(c => c.guid)}
                    labelKey={id => choices.find(c => c.guid === id).value}
                    selected={this.getSelectedMatches(response.item, choices)} />
                </ItemOption>
              ) : (
                choices.length > AUTOGEN_MAX_CHOICES
                ? (
                  this.renderMaxChoicesMessage()
                ) : (
                  <ItemOptionFlex />
                )
              )
            }
            <ItemOption className="score" label="Score">
              <div className="input-group">
                <input
                  type="number"
                  className="form-control input-sm form-control-sm"
                  disabled={!this.props.editMode}
                  value={response.score}
                  onChange={({ target: { value } }) => response.onScoreEdit(response.item, value)}
                  />
              </div>
            </ItemOption>
          </ItemOptions>
          } />
      ));
  }

  render() : JSX.Element {
    return (
      <div className="choice-feedback">
        <Button editMode={this.props.editMode}
          type="link" onClick={this.onAddFeedback}>
          Add Feedback
        </Button>
        <InputList className="feedback-items">
          {this.renderResponses()}
        </InputList>
      </div>
    );
  }
}
