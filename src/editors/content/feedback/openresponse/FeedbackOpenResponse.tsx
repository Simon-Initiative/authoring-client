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
import '../common.scss';
import { TabOptionControl } from 'editors/content/common/TabContainer';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';


export interface Props extends AbstractContentEditorProps<FeedbackOpenResponse> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
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
    return <SidebarContent title="Open-Ended Question" />;
  }

  renderToolbar() {
    return <ToolbarGroup label="Open-Ended Question"
      columns={3} highlightColor={CONTENT_COLORS.Feedback}>
    </ToolbarGroup>;
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
    const { model } = this.props;

    return (
      <div className="feedback-question-editor">
        {this.renderQuestionTitle()}
        <div className="question-body" key="question">
          <ContentContainer
            {...this.props}
            model={model.prompt.content}
            onEdit={this.onPromptEdit} />
          <br />
          <TabOptionControl name="required">
            <ToggleSwitch
              checked={model.required}
              label="Required Question"
              onClick={this.onToggleRequired} />
          </TabOptionControl>
        </div>
      </div>
    );
  }
}
