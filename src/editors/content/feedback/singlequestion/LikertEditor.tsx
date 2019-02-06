import * as React from 'react';
import { ContentElement } from 'data/content/common/interfaces';
import { Likert } from 'data/content/feedback/likert';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import { getLabelForFeedbackQuestion } from 'data/models/feedback';
import { REMOVE_QUESTION_DISABLED_MSG } from 'editors/content/question/question/Question';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import {
  AbstractContentEditor, AbstractContentEditorProps,
  AbstractContentEditorState,
} from 'editors/content/common/AbstractContentEditor';
import '../common.scss';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { Select } from 'editors/content/common/Select';

export interface Props extends AbstractContentEditorProps<Likert> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
}

export interface State extends AbstractContentEditorState {

}

export class LikertEditor extends AbstractContentEditor<Likert, Props, State> {
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

  onPromptEdit = (content: ContentElements, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt: model.prompt.with({ content }) }), src);
  }

  onScaleEdit = (scaleSize: string) => {
    const { onEdit, model } = this.props;
    onEdit(
      model.with({
        scale: model.scale.with({
          scaleSize,
          scaleCenter: String(Math.ceil(Number.parseInt(scaleSize) / 2)),
        }),
      }));
  }

  onToggleRequired = () => {
    const { model, onEdit } = this.props;
    onEdit(model.with({ required: !model.required }), model);
  }

  renderSidebar() {
    const { model } = this.props;

    const scaleOptions = [1, 3, 5, 7]
      .map(n => <option key={n} value={n}>{n}</option>);

    return (
      <SidebarContent title="Question">
        <SidebarGroup label="Scale Size">
          <Select
            editMode={this.props.editMode}
            label=""
            value={model.scale.scaleSize}
            onChange={this.onScaleEdit}>
            {scaleOptions}
          </Select>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    return null;
  }

  renderMain() {
    const { editMode, services, context, model } = this.props;

    return (
      <div className="feedback-question-editor">
        {this.renderQuestionTitle()}
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
      </div>
    );
  }
}
