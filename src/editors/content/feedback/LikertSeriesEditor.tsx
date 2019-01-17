import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  TabSection, TabSectionContent, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import guid from 'utils/guid';
import { ExplanationEditor } from 'editors/content/part/ExplanationEditor';
import { FeedbackPrompt } from 'data/content/feedback/feedback_prompt';
import { ContentElement } from 'data/content/common/interfaces';
import { LikertSeries } from 'data/content/feedback/likert_series';
import { LikertScale } from 'data/content/feedback/likert_scale';
import * as Immutable from 'immutable';
import { LikertItem } from 'data/content/feedback/likert_item';
import {
  AbstractContentEditor, AbstractContentEditorProps,
  AbstractContentEditorState,
} from 'editors/content/common/AbstractContentEditor';

export interface Props extends AbstractContentEditorProps<LikertSeries> {
  onEdit;
  model: LikertSeries;
  canRemove;
}

export interface State extends AbstractContentEditorState {

}

export class LikertSeriesEditor extends AbstractContentEditor<LikertSeries, Props, State> {

  onPromptEdit = (prompt: FeedbackPrompt, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt }), src);
  }

  onItemsEdit = (items: Immutable.OrderedMap<string, LikertItem>, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ items }), src);
  }

  onScaleEdit = (scale: LikertScale, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ scale }), src);
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  renderMain() {
    const { model } = this.props;

    return (
      <TabSection key="choices" className="choices">
        <TabSectionHeader title="How would an expert answer this question?">
        </TabSectionHeader>
        <TabSectionContent key="explanation" className="feedback">
          {/* <ExplanationEditor
            {...this.props}
            model={model.explanation}
            onEdit={(explanation, src) => this.onPartEdit(
              model.with({ explanation }),
              src)} /> */}
        </TabSectionContent>
      </TabSection>
    );
  }
}
