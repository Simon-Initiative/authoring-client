import * as React from 'react';
import { ContentElement } from 'data/content/common/interfaces';
import { FeedbackOpenResponse } from 'data/content/feedback/feedback_open_response';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import { REMOVE_QUESTION_DISABLED_MSG }
  from 'editors/content/question/question/Question';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import { AbstractContentEditor, AbstractContentEditorProps, AbstractContentEditorState }
  from 'editors/content/common/AbstractContentEditor';
import { getLabelForFeedbackQuestion } from 'data/models/feedback';
import './common.scss';


export interface Props extends AbstractContentEditorProps<FeedbackOpenResponse> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
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

  renderQuestionTitle = () => {
    const { model, canRemove, onRemove, editMode, onDuplicate } = this.props;

    return (
      <ContentTitle
        title={getLabelForFeedbackQuestion(model)}
        onDuplicate={onDuplicate}
        editMode={editMode}
        canRemove={canRemove}
        removeDisabledMessage={REMOVE_QUESTION_DISABLED_MSG}
        onRemove={onRemove}
        helpPopover={null} />
    );
  }

  renderMain() {
    const { editMode, services, context, model } = this.props;

    return (
      <div className="feedback-question-editor">
        {this.renderQuestionTitle()}
        <div className="question-body" key="question">
          Write your question:
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
      </div>
    );
  }
}
