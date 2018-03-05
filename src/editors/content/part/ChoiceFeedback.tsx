import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import * as contentTypes from '../../../data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { convert } from 'utils/format';
import { ContentElements } from 'data/content/common/elements';
import {
  InputList, InputListItem, ItemOption, ItemOptionFlex, ItemOptions,
} from 'editors/content/common/InputList.tsx';
import {
  AUTOGEN_MAX_CHOICES, autogenResponseFilter, getGeneratedResponseBody,
  getGeneratedResponseScore, modelWithDefaultFeedback,
} from 'editors/content/part/defaultFeedbackGenerator.ts';
import { CombinationsMap } from 'types/combinations';

import './ChoiceFeedback.scss';

export interface ChoiceFeedbackProps extends AbstractContentEditorProps<contentTypes.Part> {
  simpleFeedback?: boolean;
  choices: contentTypes.Choice[];
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
}

export interface ChoiceFeedbackState {
  invalidFeedback: Immutable.Map<string, boolean>;
}

/**
 * The content editor for choice feedback.
 */
export abstract class ChoiceFeedback
  extends AbstractContentEditor<contentTypes.Part, ChoiceFeedbackProps, ChoiceFeedbackState> {

  constructor(props) {
    super(props);

    this.state = {
      invalidFeedback: Immutable.Map<string, boolean>(),
    };

    this.onResponseEdit = this.onResponseEdit.bind(this);
    this.onResponseRemove = this.onResponseRemove.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onDefaultFeedbackEdit = this.onDefaultFeedbackEdit.bind(this);
    this.onEditMatchSelections = this.onEditMatchSelections.bind(this);
    this.getSelectedMatches = this.getSelectedMatches.bind(this);
  }

  onResponseEdit(response) {
    const { model, choices, onGetChoiceCombinations, onEdit } = this.props;

    let updatedModel = model.with({
      responses: model.responses.set(response.guid, response),
    });

    updatedModel = modelWithDefaultFeedback(
      updatedModel,
      choices,
      getGeneratedResponseBody(updatedModel),
      getGeneratedResponseScore(updatedModel),
      AUTOGEN_MAX_CHOICES,
      onGetChoiceCombinations,
    );

    onEdit(updatedModel);
  }

  onResponseRemove(response) {
    const { model, choices, onGetChoiceCombinations, onEdit } = this.props;

    let updatedModel = model.with({
      responses: model.responses.delete(response.guid),
    });

    updatedModel = modelWithDefaultFeedback(
      updatedModel,
      choices,
      getGeneratedResponseBody(updatedModel),
      getGeneratedResponseScore(updatedModel),
      AUTOGEN_MAX_CHOICES,
      onGetChoiceCombinations,
    );

    onEdit(updatedModel);
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

  onDefaultFeedbackEdit(body: ContentElements, score: string) {
    const { model, choices, onGetChoiceCombinations, onEdit } = this.props;

    const updatedModel = modelWithDefaultFeedback(
      model,
      choices,
      body,
      score,
      AUTOGEN_MAX_CHOICES,
      onGetChoiceCombinations,
    );
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
      <div className="message alert alert-warning">
        <i className="fa fa-info-circle"/>
        {` Providing more than ${AUTOGEN_MAX_CHOICES} choices \
        (Choice ${convert.toAlphaNotation(AUTOGEN_MAX_CHOICES - 1)}) for this question will \
        prevent you from determining exact selections for other choices.`}
      </div>
    );
  }

  renderResponses() {
    const { choices, model, context, services, editMode, simpleFeedback } = this.props;
    const { invalidFeedback } = this.state;

    // get default feedback details
    const defaultFeedbackBody = getGeneratedResponseBody(model);
    const defaultFeedbackScore = getGeneratedResponseScore(model);

    // this code takes the list of responses, filters out the auto-generated feedback
    // elements and replaces them with a single psudo-feedback element which covers all
    // other combinations of choices. By chaining these methods and adding some renderOpts,
    // we can distinguish between real responses and the psuedo one and reuse the feedback
    // rendering code

    // filter out all auto generated responses (identified by AUTOGEN string in name field)
    const userResponses = model.responses.toArray().filter(autogenResponseFilter);

    return userResponses
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
          label={response.isDefault || simpleFeedback ? '' : `${i + 1}`}
          contentTitle={
            response.isDefault ? 'Other' : ''
            || simpleFeedback ? 'Correct' : ''
          }
          context={context}
          services={services}
          editMode={editMode}
          body={response.feedbackBody}
          onEdit={body => response.onEdit(body, response.item)}
          onRemove={response.isDefault || userResponses.length === 1
            ? null
            : () => this.onResponseRemove(response.item)
          }
          options={[
            <ItemOptions key="feedback-options">
              {!response.isDefault && !simpleFeedback
                ? (
                  <ItemOption className="matches" label="Matching Choices" flex>
                    <Typeahead
                      multiple
                      bsSize="small"
                      onChange={(selected) => {
                        if (selected.length > 0) {
                          this.onEditMatchSelections(response.guid, choices, selected);

                          this.setState({
                            invalidFeedback: invalidFeedback.set(response.guid, false),
                          });
                        } else {
                          this.setState({
                            invalidFeedback: invalidFeedback.set(response.guid, true),
                          });
                        }
                      }}
                      options={choices.map(c => c.guid)}
                      labelKey={id => choices.find(c => c.guid === id).value}
                      selected={this.getSelectedMatches(response.item, choices)} />
                  </ItemOption>
                ) : (
                  response.isDefault && choices.length > AUTOGEN_MAX_CHOICES
                  ? (
                    this.renderMaxChoicesMessage()
                  ) : (
                    <ItemOptionFlex />
                  )
                )
              }
              {!simpleFeedback
                ? (
                  <ItemOption className="score" label="Score">
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control input-sm form-control-sm"
                        disabled={!this.props.editMode}
                        value={response.score}
                        onChange={({ target: { value } }) =>
                          response.onScoreEdit(response.item, value)}
                        />
                    </div>
                  </ItemOption>
                )
                : (null)
              }
            </ItemOptions>,
            <ItemOptions key="feedback-message">
              {invalidFeedback.get(response.guid) && !response.isDefault && !simpleFeedback
                ? (
                  <div className="message alert alert-warning">
                    <i className="fa fa-exclamation-circle"/>
                    {' Matching choices not updated. \
                      Feedback must contain at least one matching choice'}
                  </div>
                )
                : null
              }
            </ItemOptions>,
          ]} />
      ));
  }

  render() : JSX.Element {
    return (
      <div className="choice-feedback">
        <InputList className="feedback-items">
          {this.renderResponses()}
        </InputList>
      </div>
    );
  }
}
