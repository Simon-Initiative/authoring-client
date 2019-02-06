import * as React from 'react';
import { LikertSeries } from 'data/content/feedback/likert_series';
import * as Immutable from 'immutable';
import { LikertItem } from 'data/content/feedback/likert_item';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import { getLabelForFeedbackQuestion } from 'data/models/feedback';
import { REMOVE_QUESTION_DISABLED_MSG } from 'editors/content/question/question/Question';
import {
  AbstractContentEditor, AbstractContentEditorProps,
  AbstractContentEditorState,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import '../common.scss';
import './LikertSeriesEditor.scss';
import { QuestionTable } from './QuestionTable';
import { LikertScale } from 'data/content/feedback/likert_scale';

export interface Props extends AbstractContentEditorProps<LikertSeries> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
}

export interface State extends AbstractContentEditorState {

}

export class LikertSeriesEditor extends AbstractContentEditor<LikertSeries, Props, State> {

  onEditPrompt = (content: ContentElements) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt: model.prompt.with({ content }) }), null);
  }

  onEditItems = (items: Immutable.OrderedMap<string, LikertItem>) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ items }), null);
  }

  onEditScale = (scale: LikertScale) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ scale }));
  }

  renderToolbar() {
    return null;
  }

  renderSidebar() {
    return null;
  }

  renderMain() {
    const { editMode, services, context, model, onDuplicate, canRemove, onRemove } = this.props;

    return (
      <div className="feedback-question-editor">
        <ContentTitle
          title={getLabelForFeedbackQuestion(model)}
          onDuplicate={onDuplicate}
          editMode={editMode}
          canRemove={canRemove}
          removeDisabledMessage={REMOVE_QUESTION_DISABLED_MSG}
          onRemove={onRemove}
          helpPopover={null} />
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
            onEdit={this.onEditPrompt} />
          <br />
          <QuestionTable
            editMode={editMode}
            scale={model.scale}
            items={model.items}
            onEditItems={this.onEditItems}
            onEditScale={this.onEditScale}
          />
        </div>
      </div>
    );
  }
}
