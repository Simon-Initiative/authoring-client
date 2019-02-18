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
import { ContentElement } from 'data/content/common/interfaces';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

export interface Props extends AbstractContentEditorProps<LikertSeries> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
}

export interface State extends AbstractContentEditorState {

}

export class LikertSeriesEditor extends AbstractContentEditor<LikertSeries, Props, State> {

  onEditPrompt = (content: ContentElements, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt: model.prompt.with({ content }) }), src);
  }

  onEditItems = (items: Immutable.OrderedMap<string, LikertItem>, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ items }), src);
  }

  onEditScale = (scale: LikertScale, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ scale }), src);
  }

  renderSidebar() {
    return <SidebarContent title="Question Series" />;
  }

  renderToolbar() {
    return <ToolbarGroup label="Question Series"
      columns={3} highlightColor={CONTENT_COLORS.Feedback}>
    </ToolbarGroup>;
  }

  renderMain() {
    const { editMode, model, onDuplicate, canRemove, onRemove } = this.props;

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
            {...this.props}
            model={model.prompt.content}
            onEdit={this.onEditPrompt} />
          <br />
          <QuestionTable
            {...this.props}
            // scale={model.scale}
            // items={model.items}
            onEditItems={this.onEditItems}
            onEditScale={this.onEditScale}
          />
        </div>
      </div>
    );
  }
}