import * as React from 'react';
import { ContentElement } from 'data/content/common/interfaces';
import { FeedbackChoice } from 'data/content/feedback/feedback_choice';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import {
  AbstractContentEditorProps, AbstractContentEditorState,
  AbstractContentEditor,
} from 'editors/content/common/AbstractContentEditor';

export interface Props extends AbstractContentEditorProps<FeedbackChoice> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
  label: string;
}

export interface State extends AbstractContentEditorState {

}

export class FeedbackChoiceEditor extends AbstractContentEditor<FeedbackChoice, Props, State> {

  onTextEdit = (text: ContentElements, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ text }), src);
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  renderMain() {
    const { label, model } = this.props;

    return (
      <div className="feedback-choice-editor">
        {label}
        <ContentContainer
          {...this.props}
          model={model.text}
          onEdit={this.onTextEdit}
          overrideRemove={(model: ContentElements, childModel) => model.size < 2}
        />
      </div>
    );
  }
}
