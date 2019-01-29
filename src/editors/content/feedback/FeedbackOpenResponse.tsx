import * as React from 'react';
import { ContentElement } from 'data/content/common/interfaces';
import { FeedbackOpenResponse } from 'data/content/feedback/feedback_open_response';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import {
  AbstractContentEditor, AbstractContentEditorProps, AbstractContentEditorState,
} from 'editors/content/common/AbstractContentEditor';

export interface Props extends AbstractContentEditorProps<FeedbackOpenResponse> {

}

export interface State extends AbstractContentEditorState {

}

export class FeedbackOpenResponseEditor extends
  AbstractContentEditor<FeedbackOpenResponse, Props, State> {

  onPromptEdit = (content: ContentElements, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt: model.prompt.with({ content }) }), src);
  }

  onToggleRequired = () => {
    const { model, onEdit } = this.props;
    onEdit(model.with({ required: !model.required }), model);
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  renderMain() {
    const { editMode, services, context, model } = this.props;

    return (
      <div className="question-body" key="question">
        <ContentContainer
          activeContentGuid={this.props.activeContentGuid}
          hover={this.props.hover}
          onUpdateHover={this.props.onUpdateHover}
          onFocus={this.props.onFocus}
          editMode={editMode}
          services={services}
          context={context}
          model={model.prompt.content}
          onEdit={this.onPromptEdit} />
      </div>
    );
  }
}
