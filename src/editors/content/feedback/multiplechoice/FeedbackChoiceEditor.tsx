import * as React from 'react';
import { ContentElement } from 'data/content/common/interfaces';
import { FeedbackChoice } from 'data/content/feedback/feedback_choice';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import {
  AbstractContentEditorProps, AbstractContentEditorState,
  AbstractContentEditor,
} from 'editors/content/common/AbstractContentEditor';

import './FeedbackMultipleChoice.scss';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';

export interface Props extends AbstractContentEditorProps<FeedbackChoice> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
  label: string;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
}

export interface State extends AbstractContentEditorState {

}

export class FeedbackChoiceEditor extends AbstractContentEditor<FeedbackChoice, Props, State> {

  onTextEdit = (text: ContentElements, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ text }), src);
  }

  renderSidebar() {
    return <SidebarContent title="Question Choice" />;
  }

  renderToolbar() {
    return <ToolbarGroup label="Question Choice"
      columns={3} highlightColor={CONTENT_COLORS.FeedbackChoice}>
    </ToolbarGroup>;
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
