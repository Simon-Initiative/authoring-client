import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import {
  InputList, InputListItem, ItemOption, ItemOptionFlex, ItemOptions,
} from 'editors/content/common/InputList.tsx';
import { ContentElements } from 'data/content/common/elements';
import './Feedback.scss';
import { ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';

export interface FeedbackProps extends AbstractContentEditorProps<contentTypes.Part> {

}

export interface FeedbackState {

}

/**
 * The content editor for choice feedback.
 */
export abstract class Feedback
  extends AbstractContentEditor<contentTypes.Part, FeedbackProps, FeedbackState> {

  constructor(props) {
    super(props);

    this.onResponseEdit = this.onResponseEdit.bind(this);
    this.onResponseRemove = this.onResponseRemove.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
  }

  onResponseEdit(response) {
    const { model, onEdit } = this.props;

    const updatedModel = model.with({
      responses: model.responses.set(response.guid, response),
    });

    onEdit(updatedModel);
  }

  onResponseRemove(response) {
    const { model, onEdit } = this.props;

    const updatedModel = model.with({
      responses: model.responses.delete(response.guid),
    });

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
    let feedback = response.feedback.first() || new contentTypes.Feedback();
    feedback = feedback.with({ body });

    const updatedResponse = response.with({
      feedback: response.feedback.set(feedback.guid, feedback),
    });

    this.onResponseEdit(updatedResponse);
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
    const { model, context, services, editMode } = this.props;

    return model.responses.toArray()
      // if a default response doesnt exist, create one and append it to the list
      .concat(this.getDefaultResponse() ? [] : new contentTypes.Response({
        match : '*',
      }))
      .map((response, i) => {
        const isDefault = response.match === '*';

        return (
          <InputListItem
            key={response.guid}
            className="response"
            id={response.guid}
            label={isDefault ? '' : `${i + 1}`}
            contentTitle={isDefault ? 'Other Feedback' : ''}
            context={context}
            services={services}
            editMode={editMode}
            body={response.feedback.first() ? response.feedback.first().body
              : ContentElements.fromText('', '', ALT_FLOW_ELEMENTS)}
            onEdit={body => this.onBodyEdit(body, response)}
            onRemove={isDefault ? undefined : () => this.onResponseRemove(response)}
            options={
            <ItemOptions>
              {!isDefault
                ? (
                  <ItemOption className="matches" label="Matching Pattern" flex>
                    <input
                      className="form-control input-sm form-control-sm"
                      disabled={!this.props.editMode}
                      value={response.match}
                      onChange={({ target: { value } }) =>
                        this.onEditMatch(response.guid, value)} />
                  </ItemOption>
                ) : (
                  <ItemOptionFlex />
                )
              }
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
            </ItemOptions>
            } />
        );
      });
  }

  render() : JSX.Element {
    return (
      <div className="feedback">
        <InputList className="feedback-items">
          {this.renderResponses()}
        </InputList>
      </div>
    );
  }
}
