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
    const { model, choices } = this.props;

    // remove all existing default responses
    const userResponses = model.responses.filter(r => !r.name.match(/^AUTOGEN.*/));

    let generatedResponses;
    if (choices.length > AUTOGEN_MAX_CHOICES) {
      const feedback = new contentTypes.Feedback({
        body,
      });
      const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

      generatedResponses = [
        new contentTypes.Response({
          name: 'AUTOGEN',
          score,
          match: '*',
          feedback: feedbacks.set(feedback.guid, feedback),
        }),
      ];
    } else {
      // generate new default responses
      generatedResponses = this.generateFeedbackCombinations(userResponses).map((combo) => {
        const newGuid = createGuid();
        const feedback = new contentTypes.Feedback({
          // body: body.with({ guid: newGuid }),
          body: new Html({ contentState: body.contentState }),
        });
        const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();
        const match = combo.map(id => choices.find(c => c.guid === id).value).join(',');

        return new contentTypes.Response({
          name: 'AUTOGEN',
          score,
          match,
          feedback: feedbacks.set(feedback.guid, feedback),
        });
      });
    }

    const updatedModel = this.props.model.with({
      responses: Immutable.OrderedMap(
        userResponses.concat(
          generatedResponses.reduce((acc, i) => { acc[i.guid] = i; return acc; }, {}),
        ),
      ),
    });

    this.props.onEdit(updatedModel);
  }

  /**
   * Generates the remaining feedback match combinations of choices not specified by the user
   */
  generateFeedbackCombinations(userResponses) {
    const { choices } = this.props;

    // function that recursively generates all combinations of the specified ids
    const recursiveCombination = (ids, prefix = []) => (
      // combine nested arrays into a single result array
      ids.reduce(
        (acc, id, i) => (
          // return an array containing the current new combination
          // and recursively add remaining combinations
          acc.concat([
            [...prefix, id],
            ...recursiveCombination(ids.slice(i + 1), [...prefix, id]),
          ])
        ),
        [],
      )
    );

    const allCombinations = recursiveCombination(choices.map(c => c.guid));
    const existingCombinations = userResponses.map(response => (
        response.match.split(',').map(m =>
            choices.find(c => c.value === m) && choices.find(c => c.value === m).guid,
        ).filter(s => s)
      ),
    );

    const setsEqual = (set1: string[], set2: string[]): boolean => {
      return set1.length === set2.length
        && set1.reduce((acc, i) => acc && !!set2.find(j => j === i), true)
        && set2.reduce((acc, i) => acc && !!set1.find(j => j === i), true);
    };

    /// return the difference of all combinations and existing combinations
    return allCombinations.filter(combination =>
      !existingCombinations.reduce((acc, e) => acc || setsEqual(e, combination), false),
    );
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

  renderFeedbackContent(response) {
    return (
      <div className="feedback-content">
        {response.isDefault ? 'All Other Choices' : null}
        <HtmlContentEditor
          editorStyles={HTML_CONTENT_EDITOR_STYLE}
          inlineToolbar={<InlineToolbar/>}
          blockToolbar={<BlockToolbar/>}
          inlineInsertionToolbar={<InlineInsertionToolbar/>}
          {...this.props}
          model={response.feedbackBody}
          onEdit={body => response.onEdit(body, response.item)} />
      </div>
    );
  }

  renderMaxChoicesMessage() {
    return (
      <div className="message">
        <div className="alert alert-warning flex-spacer">
          <strong>NOTE</strong>&nbsp;&nbsp;When the number of choices is greater
          than {AUTOGEN_MAX_CHOICES} (Choice {convert.toAlphaNotation(AUTOGEN_MAX_CHOICES)}),
          you will not be able to determine exact selections for all other choices.
        </div>
        <div className="flex-spacer"/>
      </div>
    );
  }

  renderFeedbackScore(response) {
    return (
      <div className="score">
        <div className="option-label">
          Score
        </div>
        <div className="option-content">
          <div className="input-group">
            <input
              type="number"
              className="form-control input-sm form-control-sm"
              disabled={!this.props.editMode}
              value={response.score}
              onChange={({ target: { value } }) => response.onScoreEdit(response.item, value)}
              />
          </div>
        </div>
      </div>
    );
  }

  renderFeedbackOptions(response, choices) {
    return (
      <div className="feedback-options">
        {!response.isDefault
          ? (
            <div className="matches">
              <div className="option-label">
                Matching Choices
              </div>
              <div className="option-content">
                <Typeahead
                  multiple
                  bsSize="small"
                  onChange={selected =>
                    this.onEditMatchSelections(response.guid, choices, selected)}
                  options={choices.map(c => c.guid)}
                  labelKey={id => choices.find(c => c.guid === id).value}
                  selected={this.getSelectedMatches(response.item, choices)} />
              </div>
            </div>
          )
          : (
            choices.length > AUTOGEN_MAX_CHOICES
            ? (
              this.renderMaxChoicesMessage()
            )
            : (
              <div className="flex-spacer"/>
            )
          )
        }
        {this.renderFeedbackScore(response)}
      </div>
    );
  }

  renderFeedbackRemoveBtn(response) {
    return !response.isDefault
      ? (
      <Remove
        editMode={this.props.editMode}
        onRemove={() => this.onResponseRemove(response.item)} />
      )
      : (
        <span className="remove-btn"></span>
      );
  }

  renderResponses() {
    const { choices, model, onEdit } = this.props;

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
      // add the psudo-feedback element for all other choices and it render last
      .concat([{
        guid: 'default-feedback',
        isDefault: true,
        feedbackBody: defaultFeedbackBody,
        onEdit: (body, item) => this.onDefaultFeedbackEdit(body, defaultFeedbackScore),
        score: defaultFeedbackScore,
        onScoreEdit: (response, value) => this.onDefaultFeedbackEdit(defaultFeedbackBody, value),
        item: undefined,
      }])
      // finally, render all response elements and the psudo-feedback element
      .map((response, i) => (
        <div key={response.guid} className="response">
          <div className="feedback-label">
            {response.isDefault ? '' : i + 1}
          </div>
          <div className="feedback-item">
            {this.renderFeedbackContent(response)}
            {this.renderFeedbackOptions(response, choices)}
          </div>
          {this.renderFeedbackRemoveBtn(response)}
        </div>
      ));
  }

  render() : JSX.Element {
    return (
      <div className="choice-feedback">
        <Button editMode={this.props.editMode}
          type="link" onClick={this.onAddFeedback}>
          Add Feedback
        </Button>
        <div className="feedback-items">
          {this.renderResponses()}
        </div>
      </div>
    );
  }
}
