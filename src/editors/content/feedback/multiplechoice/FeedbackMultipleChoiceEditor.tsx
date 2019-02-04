import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentElement } from 'data/content/common/interfaces';
import { FeedbackMultipleChoice } from 'data/content/feedback/feedback_multiple_choice';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import {
  AbstractContentEditor, AbstractContentEditorProps, AbstractContentEditorState,
} from 'editors/content/common/AbstractContentEditor';
import { getLabelForFeedbackQuestion } from 'data/models/feedback';
import { REMOVE_QUESTION_DISABLED_MSG } from 'editors/content/question/question/Question';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import { FeedbackChoice } from 'data/content/feedback/feedback_choice';
import guid from 'utils/guid';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';

export interface Props extends AbstractContentEditorProps<FeedbackMultipleChoice> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
}

export interface State extends AbstractContentEditorState {

}

export class FeedbackMultipleChoiceEditor extends
  AbstractContentEditor<FeedbackMultipleChoice, Props, State> {

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

  onChoiceEdit = (elements: ContentElements, src: ContentElement) => {
    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      choices: Immutable.OrderedMap<string, FeedbackChoice>(items),
    });

    this.props.onEdit(model, src);
  }

  onAddChoice = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { model, onEdit } = this.props;
    const { choices } = model;

    const id = guid();

    const choice = new FeedbackChoice().with({
      guid: id,
      id,
    });

    onEdit(model.with({ choices: choices.set(choice.guid, choice) }), choice);
  }

  onToggleRequired = () => {
    const { model, onEdit } = this.props;
    onEdit(model.with({ required: !model.required }), model);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Multiple Choice" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Multiple Choice" columns={3} highlightColor={CONTENT_COLORS.Activity}>
      </ToolbarGroup>
    );
  }

  renderMain() {
    const { editMode, services, context, model, activeContentGuid, hover,
      onUpdateHover, onFocus } = this.props;

    const choices = new ContentElements().with({
      content: model.choices,
      supportedElements: Immutable.List(['choice']),
    });

    const getLabel = (e, i) => <span>{'Choice ' + (i + 1)}</span>;
    const labels = {};
    model.choices.toArray().map((e, i) => labels[e.guid] = getLabel(e, i));
    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    return (
      <div className="feedback-question-editor">
        <div className="feedback-question">
          {this.renderQuestionTitle()}
          <div className="question-body" key="question">
            Enter your question:
            <ContentContainer
              activeContentGuid={activeContentGuid}
              hover={hover}
              onUpdateHover={onUpdateHover}
              onFocus={onFocus}
              editMode={editMode}
              services={services}
              context={context}
              model={model.prompt.content}
              onEdit={this.onPromptEdit} />
            <div className="choicesContainer">
              <ContentContainer
                {...this.props}
                model={choices}
                bindProperties={bindLabel}
                onEdit={this.onChoiceEdit}
                overrideRemove={(model: ContentElements, childModel) => model.size < 2}
              />
              <button type="button"
                disabled={!editMode}
                onClick={this.onAddChoice}
                className="btn btn-link">+ Add choice</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
