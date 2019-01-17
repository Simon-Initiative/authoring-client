import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  TabSection, TabSectionContent, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import guid from 'utils/guid';
import { ExplanationEditor } from 'editors/content/part/ExplanationEditor';
import { FeedbackPrompt } from 'data/content/feedback/feedback_prompt';
import { ContentElement } from 'data/content/common/interfaces';
import { Likert } from 'data/content/feedback/likert';
import { LikertScale } from 'data/content/feedback/likert_scale';
import {
  AbstractContentEditor, AbstractContentEditorProps,
  AbstractContentEditorState,
} from 'editors/content/common/AbstractContentEditor';

export interface Props extends AbstractContentEditorProps<Likert> {
  onEdit;
  model: Likert;
  canRemove;
}

export interface State extends AbstractContentEditorState {

}

export class LikertEditor extends AbstractContentEditor<Likert, Props, State> {

  onPromptEdit = (prompt: FeedbackPrompt, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt }), src);
  }

  onScaleEdit = (scale: LikertScale, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ scale }), src);
  }

  onToggleRequired = () => {
    const { model, onEdit } = this.props;
    onEdit(model.with({ required: !model.required }), this);
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
