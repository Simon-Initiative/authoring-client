import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import * as contentTypes from 'data/contentTypes';
import { ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { convert } from 'utils/format';
import { ContentElements } from 'data/content/common/elements';
import {
  InputList, InputListItem, ItemOption, ItemOptionFlex, ItemOptions,
} from 'editors/content/common/InputList';
import {
  AUTOGEN_MAX_CHOICES, autogenResponseFilter, getGeneratedResponseItem,
  getGeneratedResponseBody, getGeneratedResponseScore, modelWithDefaultFeedback,
} from 'editors/content/part/defaultFeedbackGenerator';
import { CombinationsMap } from 'types/combinations';
import guid from 'utils/guid';

import './ChoiceFeedback.scss';

export interface ChoiceFeedbackProps extends AbstractContentEditorProps<contentTypes.Part> {
  hideOther?: boolean;
  simpleFeedback?: boolean;
  choices: contentTypes.Choice[];
  onInvalidFeedback?: (responseGuid : string) => void;
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

  defaultFeedbackResponse: contentTypes.Response;
  placeholderResponse: contentTypes.Response;

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

    this.placeholderResponse = this.buildResponsePlaceholder();
    this.defaultFeedbackResponse = getGeneratedResponseItem(props.model) ||
    this.newDefaultFeedback();
  }

  newDefaultFeedback(newGuid?) {
    const g = newGuid || guid();
    return new contentTypes.Response({
      feedback: Immutable.OrderedMap({
        [g]: contentTypes.Feedback.fromText('', g),
      }),
    });
  }

  shouldComponentUpdate(nextProps: ChoiceFeedbackProps, nextState: ChoiceFeedbackState) {
    return this.props.model !== nextProps.model
      || this.props.parent !== nextProps.parent
      || this.props.editMode !== nextProps.editMode
      || this.props.activeContentGuid !== nextProps.activeContentGuid
      || this.props.hover !== nextProps.hover
      || this.props.simpleFeedback !== nextProps.simpleFeedback
      || this.props.choices !== nextProps.choices
      || this.state.invalidFeedback !== nextState.invalidFeedback;
  }

  onResponseEdit(response, src) {
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

    onEdit(updatedModel, src);
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

    console.log('Score edit:', model, score, response);

    const updatedModel = model.with({
      responses: model.responses.set(
        response.guid,
        response.with({ score }),
      ),
    });

    console.log('updated model:', updatedModel);

    onEdit(updatedModel);
  }

  onBodyEdit(body, response, source) {
    let feedback = response.feedback.first();
    feedback = feedback.with({ body });

    const updatedResponse = response.with({
      feedback: response.feedback.set(feedback.guid, feedback),
    });

    this.onResponseEdit(updatedResponse, source);
  }

  onDefaultFeedbackEdit(body: ContentElements, score: string, src) {
    const { model, choices, onGetChoiceCombinations, onEdit } = this.props;

    console.log('Default feedback edit:', score, body);

    const updatedModel = modelWithDefaultFeedback(
      model,
      choices,
      body,
      score,
      AUTOGEN_MAX_CHOICES,
      onGetChoiceCombinations,
    );
    console.log('updated model:', updatedModel);
    onEdit(updatedModel, src);
  }

  onEditMatchSelections(responseId, choices, selected) {

    const { model, onGetChoiceCombinations, onEdit } = this.props;

    const updatedPart = model.with({
      responses: model.responses.set(
        responseId,
        model.responses.get(responseId).with({
          match: selected.map(id =>
            (choices.find(c => c.guid === id) || { value: '' }).value,
          )
          .filter(x => x !== '')
          .join(','),
        }),
      ),
    });

    const updatedModel = modelWithDefaultFeedback(
      updatedPart,
      choices,
      getGeneratedResponseBody(updatedPart),
      getGeneratedResponseScore(updatedPart),
      AUTOGEN_MAX_CHOICES,
      onGetChoiceCombinations,
    );
    onEdit(updatedModel, null);
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

  buildResponsePlaceholder() : contentTypes.Response {

    const feedback = new contentTypes.Feedback({
      body: ContentElements.fromText('', '', ALT_FLOW_ELEMENTS),
    });
    const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

    return new contentTypes.Response({
      guid: guid(),
      score: '1',
      feedback: feedbacks.set(feedback.guid, feedback),
    });
  }

  renderResponses() {
    const { choices, model, context, services, editMode, simpleFeedback } = this.props;
    const { invalidFeedback } = this.state;

    // filter out all auto generated responses (identified by AUTOGEN string in name field)
    const userResponses = model.responses.toArray().filter(autogenResponseFilter);

    const responsesOrPlaceholder = userResponses.length === 0
      ? [this.placeholderResponse]
      : userResponses;

    return responsesOrPlaceholder
      .map((response, i) => {
        return (
        <InputListItem
          activeContentGuid={this.props.activeContentGuid}
          hover={this.props.hover}
          onUpdateHover={this.props.onUpdateHover}
          onFocus={this.props.onFocus}
          key={response.guid}
          className="response"
          id={response.guid}
          label={simpleFeedback ? '' : `${i + 1}`}
          contentTitle={simpleFeedback ? 'Correct' : ''}
          context={context}
          services={services}
          editMode={editMode}
          body={response.feedback.first().body}
          onEdit={(body, source) => this.onBodyEdit(body, response, source)}
          onRemove={userResponses.length === 1
            ? null
            : () => this.onResponseRemove(response)
          }
          options={[
            <ItemOptions key="feedback-options">
              {!simpleFeedback
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
                          if (this.props.onInvalidFeedback) {
                            this.props.onInvalidFeedback(response.guid);
                          }
                        }
                      }}
                      options={choices.map(c => c.guid)}
                      labelKey={id => choices.find(c => c.guid === id).value}
                      selected={this.getSelectedMatches(response, choices)} />
                  </ItemOption>
                )
                : (<ItemOptionFlex />)
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
                        onChange={({ target: { value } }) => this.onScoreEdit(response, value)}
                        />
                    </div>
                  </ItemOption>
                )
                : (null)
              }
            </ItemOptions>,
            <ItemOptions key="feedback-message">
              {invalidFeedback.get(response.guid) && !simpleFeedback
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
        );
      });
  }

  renderDefaultResponse() {
    const { choices, model, context, services, editMode, simpleFeedback } = this.props;

    console.log('\n\n\n\n\n\nbegin render');
    console.log('default feedback response: ', this.defaultFeedbackResponse);

    console.log('all responses:', model.responses);
    // find any response which was autogenerated, this will be considered
    const defaultResponseItem = getGeneratedResponseItem(model);
    const defaultFeedbackScore = getGeneratedResponseScore(model);
    console.log('defaultresponseitem:', defaultResponseItem,
                'defaultfeedbackscore:', defaultFeedbackScore);

    let defaultResponse = this.defaultFeedbackResponse;
    if (defaultResponseItem) {
      defaultResponse = defaultResponse.with({
        feedback: defaultResponseItem.feedback,
      });
      console.log('with defaultresponseitem: ', defaultResponse);
    }

    return (
      <InputListItem
        activeContentGuid={this.props.activeContentGuid}
        hover={this.props.hover}
        onUpdateHover={this.props.onUpdateHover}
        onFocus={this.props.onFocus}
        key={defaultResponse.guid}
        className="response"
        id={defaultResponse.guid}
        label=""
        contentTitle="Other"
        context={context}
        services={services}
        editMode={!this.props.hideOther && editMode}
        body={defaultResponse.feedback.first().body}
        onEdit={(body, source) => this.onDefaultFeedbackEdit(body, defaultFeedbackScore, source)}
        options={[
          <ItemOptions key="feedback-options">
            {choices.length > AUTOGEN_MAX_CHOICES
              ? (
                this.renderMaxChoicesMessage()
              ) : (
                <ItemOptionFlex />
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
                      value={defaultResponse.score}
                      onChange={({ target: { value } }) => this.onScoreEdit(defaultResponse, value)}
                      />
                  </div>
                </ItemOption>
              )
              : (null)
            }
          </ItemOptions>,
        ]} />
    );
  }

  render() : JSX.Element {
    return (
      <div className="choice-feedback">
        <InputList className="feedback-items">
          {this.renderResponses()}
          {this.renderDefaultResponse()}
        </InputList>
      </div>
    );
  }
}
