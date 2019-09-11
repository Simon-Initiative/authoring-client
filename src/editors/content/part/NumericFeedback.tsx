import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import {
  InputList, InputListItem, ItemOption, ItemOptionFlex, ItemOptions,
} from 'editors/content/common/InputList';
import guid from 'utils/guid';

const NumericMatchOptions = require('./NumericMatchOptions.bs').jsComponent;

import './Feedback.scss';
import { ConditionalBranchSelect } from '../common/BranchSelect';
import { Maybe } from 'tsmonad';

export interface NumericFeedbackProps extends AbstractContentEditorProps<contentTypes.Part> {
  branchingQuestions: Maybe<number[]>;
}

export interface NumericFeedbackState {

}

/**
 * The content editor for choice feedback.
 */
export abstract class NumericFeedback
  extends AbstractContentEditor<contentTypes.Part, NumericFeedbackProps, NumericFeedbackState> {
  defaultFeedbackResponse: contentTypes.Response;

  constructor(props) {
    super(props);

    this.onResponseEdit = this.onResponseEdit.bind(this);
    this.onResponseRemove = this.onResponseRemove.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onEditMatch = this.onEditMatch.bind(this);
  }

  onResponseEdit(response, source) {
    const { model, onEdit } = this.props;

    const updatedModel = model.with({
      responses: model.responses.set(response.guid, response),
    });

    onEdit(updatedModel, source);
  }

  onResponseRemove(response) {
    // need at least 1 right and 1 wrong
    if (this.props.model.responses.size <= 2) {
      return;
    }
    const { model, onEdit } = this.props;

    const updatedModel = model.with({
      responses: model.responses.delete(response.guid),
    });

    onEdit(updatedModel);
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const { model, onEdit } = this.props;

    onEdit(model.with({
      responses: model.responses.set(
        response.guid,
        model.responses.get(response.guid).with({
          score: score === '' ? Maybe.nothing<string>() : Maybe.just(score),
        }),
      ),
    }));
  }

  onBodyEdit(body, response, source) {
    let feedback = response.feedback.first();
    feedback = feedback.with({ body });

    const updatedResponse = response.with({
      feedback: response.feedback.set(feedback.guid, feedback),
    });

    this.onResponseEdit(updatedResponse, source);
  }

  onEditMatch(responseId, match: string) {
    const { model, onEdit } = this.props;

    onEdit(model.with({
      responses: model.responses.set(
        responseId,
        model.responses.get(responseId).with({
          match,
        }),
      ),
    }));
  }

  /** Returns the default response if it exists. Otherwise, returns undefined */
  getDefaultResponse() {
    const { model } = this.props;

    return model.responses.find(r => r.match === '*');
  }

  renderResponses() {
    const { model, context, services, editMode, branchingQuestions } = this.props;

    return model.responses.toArray().filter(r => r.match !== '*')
      .map((response, i) => {
        const feedback = response.feedback.first();

        return (
          <InputListItem
            activeContentGuid={this.props.activeContentGuid}
            hover={this.props.hover}
            onUpdateHover={this.props.onUpdateHover}
            onFocus={this.props.onFocus}
            key={response.guid}
            className="response"
            id={response.guid}
            label={`${i + 1}`}
            contentTitle={''}
            context={context}
            services={services}
            editMode={editMode}
            body={feedback.body}
            onEdit={(body, source) => this.onBodyEdit(body, response, source)}
            onRemove={this.props.model.responses.size > 2 ?
              () => this.onResponseRemove(response) :
              undefined}
            options={
              <ItemOptions>
                <ItemOption className="matches" label="Matching Condition" flex>
                  <NumericMatchOptions
                    editMode={this.props.editMode}
                    responseId={response.guid}
                    matchPattern={response.match}
                    onEditMatch={this.onEditMatch} />
                </ItemOption>
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
              </ItemOptions>
            }>
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
    const { context, services, editMode, branchingQuestions } = this.props;

    if (!this.defaultFeedbackResponse) {
      const newGuid = guid();

      this.defaultFeedbackResponse = new contentTypes.Response({
        match: '*',
        feedback: Immutable.OrderedMap({
          [newGuid]: contentTypes.Feedback.fromText('', newGuid),
        }),
      });
    }

    const defaultResponseItem = this.getDefaultResponse();

    let defaultResponse = this.defaultFeedbackResponse;
    if (defaultResponseItem) {
      defaultResponse = defaultResponseItem;
    }
    const feedback = defaultResponse.feedback.first();

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
        editMode={editMode}
        body={feedback.body}
        onEdit={(body, source) => this.onBodyEdit(body, defaultResponse, source)}
        options={
          <ItemOptions>
            <ItemOptionFlex />
            <ItemOption className="score" label="Score">
              <div className="input-group">
                <input
                  type="number"
                  className="form-control input-sm form-control-sm"
                  disabled={!this.props.editMode}
                  value={defaultResponse.score.valueOr('')}
                  onChange={({ target: { value } }) => this.onScoreEdit(defaultResponse, value)}
                />
              </div>
            </ItemOption>
          </ItemOptions>
        }>
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
      <div className="feedback">
        <InputList className="feedback-items">
          {this.renderResponses()}
          {this.renderDefaultResponse()}
        </InputList>
      </div>
    );
  }
}
