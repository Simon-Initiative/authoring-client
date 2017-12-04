import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Button } from '../common/controls';
import { FeedbackEditor } from './FeedbackEditor';
import { FeedbackRow } from './FeedbackRow';

export interface TabularFeedback {
}

export interface TabularFeedbackProps extends AbstractContentEditorProps<contentTypes.Part> {
  input?: string;
}

export interface TabularFeedbackState {
}


/**
 * The content editor for HtmlContent.
 */
export abstract class TabularFeedback
  extends AbstractContentEditor<contentTypes.Part, TabularFeedbackProps, TabularFeedbackState> {

  constructor(props) {
    super(props);

    this.onAdd = this.onAdd.bind(this);
    this.onResponseRemove = this.onResponseRemove.bind(this);
    this.onResponseEdit = this.onResponseEdit.bind(this);
  }

  onResponseEdit(response) {
    const model = this.props.model.with({
      responses: this.props.model.responses.set(response.guid, response),
    });
    this.props.onEdit(model);
  }

  onAdd() {
    const feedback = new contentTypes.Feedback();
    const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

    let response = new contentTypes.Response({
      score: '0',
      match: '*',
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
    const model = this.props.model.with({
      responses: this.props.model.responses.delete(response.guid),
    });
    this.props.onEdit(model);
  }

  renderRows() {
    return this.props.model.responses.toArray()
      .map(r => (
        <FeedbackRow
          {...this.props}
          key={r.guid}
          onEdit={this.onResponseEdit}
          model={r}
          onRemove={this.onResponseRemove} />
        ));
  }

  render() : JSX.Element {

    const expanded =
        <Button editMode={this.props.editMode}
          type="link" onClick={this.onAdd}>Add Feedback</Button>;

    const rows = this.renderRows();

    return (
      <div className="tabular-feedback">
        <Button editMode={this.props.editMode}
          type="link" onClick={this.onAdd}>
          Add Feedback
        </Button>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Match</th>
              <th>Score</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }

}

