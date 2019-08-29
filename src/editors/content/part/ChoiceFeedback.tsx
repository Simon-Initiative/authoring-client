import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import * as contentTypes from 'data/contentTypes';
import { ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentElements } from 'data/content/common/elements';
import {
  InputList, InputListItem, ItemOption, ItemOptionFlex, ItemOptions,
} from 'editors/content/common/InputList';
import {
  AUTOGEN_MAX_CHOICES, autogenResponseFilter, getGeneratedResponseItem, modelWithDefaultFeedback,
  renderMaxChoicesWarning,
  getGeneratedResponseBody,
  getGeneratedResponseScore,
} from 'editors/content/part/defaultFeedbackGenerator';
import { CombinationsMap } from 'types/combinations';
import guid from 'utils/guid';
import { Maybe } from 'tsmonad';

import './ChoiceFeedback.scss';
import { ConditionalBranchSelect } from '../common/BranchSelect';
import { classNames } from 'styles/jss';

export interface ChoiceFeedbackProps extends AbstractContentEditorProps<contentTypes.Part> {
  hideIncorrect?: boolean;
  simpleFeedback?: boolean;
  choices: contentTypes.Choice[];
  onInvalidFeedback?: (responseGuid: string) => void;
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
  branchingQuestions: Maybe<number[]>;
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
    this.defaultFeedbackResponse = this.buildResponsePlaceholder(true);
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

    const oldMatch = model.responses.get(response.guid).match;

    let updatedModel = model.with({
      responses: model.responses.set(response.guid, response),
    });

    // don't update model when just score or text changes
    if (oldMatch !== response.match) {
      updatedModel = modelWithDefaultFeedback(
        updatedModel,
        choices,
        getGeneratedResponseBody(updatedModel),
        getGeneratedResponseScore(updatedModel),
        onGetChoiceCombinations,
      );
    }

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
      onGetChoiceCombinations,
    );

    onEdit(updatedModel);
  }

  onScoreEdit(response, score) {
    const { model, onEdit } = this.props;

    const updatedModel = model.with({
      responses: response.match.match(/^AUTOGEN.*/) ? model.responses.map(
        x => x.match.match(/^AUTOGEN.*/) ? x.with({ score }) : x).toOrderedMap()
        : model.responses.set(response.guid, response.with({ score }),
        ),
    });

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

  onDefaultFeedbackEdit(
    body: ContentElements, score: string, src, responseGuid: string, lang?: string) {
    const { model, onEdit } = this.props;

    const updatedModel = model.with({
      responses: model.responses.map((response) => {
        if (!response.name.match(/^AUTOGEN.*/)) return response;

        const feedbacks = response.feedback ||
          Immutable.OrderedMap<string, contentTypes.Feedback>();

        let feedback = (response.feedback && response.feedback.first())
          || new contentTypes.Feedback({ guid: guid() });
        feedback = feedback.with({
          body: response.guid === responseGuid ? body : body.clone(),
        });
        if (lang !== undefined) {
          feedback = feedback.with({
            lang,
          });
        }
        return response.with({
          score: score === '' ? Maybe.nothing() : Maybe.just(score),
          feedback: feedbacks.set(feedback.guid, feedback),
        });
      }).toOrderedMap(),
    });

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
      onGetChoiceCombinations,
    );

    onEdit(updatedModel, null);
  }

  getSelectedMatches(response, choices) {
    return response.match.split(',').filter(m => m).map((m) => {
      const choice = choices.find(c => c.value === m);
      return choice && choice.guid;
    }).filter(s => s);
  }

  buildResponsePlaceholder(scoreZero?: boolean): contentTypes.Response {

    const feedback = new contentTypes.Feedback({
      body: ContentElements.fromText('', '', ALT_FLOW_ELEMENTS),
    });
    const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

    return new contentTypes.Response({
      guid: guid(),
      score: scoreZero ? Maybe.just('0') : Maybe.just('1'),
      feedback: feedbacks.set(feedback.guid, feedback),
    });
  }

  renderResponses() {
    const { choices, model, context, services, editMode, simpleFeedback,
      branchingQuestions } = this.props;
    const { invalidFeedback } = this.state;

    // filter out all auto generated responses (identified by AUTOGEN string in name field)
    const userResponses = model.responses.toArray().filter(autogenResponseFilter);

    const responsesOrPlaceholder = userResponses.length === 0
      ? [this.placeholderResponse]
      : userResponses;

    return responsesOrPlaceholder
      .map((response, i) => {

        const feedback = response.feedback.first();

        return (
          <InputListItem
            activeContentGuid={this.props.activeContentGuid}
            hover={this.props.hover}
            onUpdateHover={this.props.onUpdateHover}
            onFocus={this.props.onFocus}
            key={response.guid}
            className={classNames(['response', simpleFeedback && 'simplefeedback'])}
            id={response.guid}
            label={!simpleFeedback && `${i + 1}`}
            contentTitle={simpleFeedback ? 'Correct' : ''}
            context={context}
            services={services}
            editMode={editMode}
            body={feedback.body}
            onEdit={(body, source) => this.onBodyEdit(body, response, source)}
            onRemove={userResponses.length <= 1
              ? undefined
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
                            this.onEditMatchSelections(
                              response.guid, this.props.choices, selected);

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
                        selected={this.getSelectedMatches(response, this.props.choices)} />
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
                          value={response.score.valueOr('')}
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
                      <i className="fa fa-exclamation-circle" />
                      {' Matching choices not updated. \
                      Feedback must contain at least one matching choice'}
                    </div>
                  )
                  : null
                }
              </ItemOptions>,
            ]}>
            <ConditionalBranchSelect
              editMode={editMode}
              branch={feedback.lang}
              onChange={lang => this.onResponseEdit(
                response.with({
                  feedback: response.feedback.set(feedback.guid, feedback.with({ lang })),
                }),
                null)}
              questions={branchingQuestions}
            />
          </InputListItem>
        );
      });
  }

  renderDefaultResponse() {
    const { choices, model, context, services, editMode, simpleFeedback,
      branchingQuestions } = this.props;

    // If there's 1 choice, there can be no incorrect/other feedback
    if (choices.length <= 1) {
      return null;
    }

    const defaultResponse = getGeneratedResponseItem(model) || this.defaultFeedbackResponse;
    const defaultResponseGuid = defaultResponse.guid;
    const feedback = defaultResponse.feedback.first();

    return (
      <InputListItem
        activeContentGuid={this.props.activeContentGuid}
        hover={this.props.hover}
        onUpdateHover={this.props.onUpdateHover}
        onFocus={this.props.onFocus}
        key={defaultResponse.guid}
        className={classNames(['response', simpleFeedback && 'simplefeedback'])}
        id={defaultResponse.guid}
        label={!simpleFeedback && ''}
        contentTitle="Incorrect"
        context={context}
        services={services}
        editMode={!this.props.hideIncorrect && editMode}
        body={feedback.body}
        onEdit={(body, source) =>
          this.onDefaultFeedbackEdit(
            body, defaultResponse ? defaultResponse.score.valueOr('') : '0',
            source, defaultResponseGuid)}
        options={[
          <ItemOptions key="feedback-options">
            {choices.length > AUTOGEN_MAX_CHOICES
              ? (
                renderMaxChoicesWarning()
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
                      disabled={this.props.hideIncorrect || !editMode}
                      value={defaultResponse.score.valueOr('')}
                      onChange={({ target: { value } }) =>
                        this.onScoreEdit(defaultResponse, value)}
                    />
                  </div>
                </ItemOption>
              )
              : (null)
            }
          </ItemOptions>,
        ]}>
        <ConditionalBranchSelect
          editMode={editMode}
          branch={feedback.lang}
          onChange={lang => this.onResponseEdit(
            defaultResponse.with({
              feedback: defaultResponse.feedback.set(feedback.guid, feedback.with({ lang })),
            }),
            null)}
          questions={branchingQuestions}
        />
      </InputListItem>
    );
  }

  render(): JSX.Element {
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
