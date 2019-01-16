import * as React from 'react';
import {
  TabSection, TabSectionContent, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { ExplanationEditor } from 'editors/content/part/ExplanationEditor';
import { ContentElement } from 'data/content/common/interfaces';
import { FeedbackChoice } from 'data/content/feedback/feedback_choice';
import { ContentElements } from 'data/content/common/elements';

export interface Props {
  onEdit;
  model: FeedbackChoice;
}

export interface State {

}

export class FeedbackChoiceEditor extends React.PureComponent<Props, State> {

  onTextEdit = (text: ContentElements, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ text }), src);
  }

  render() {
    const { model } = this.props;

    return (
      <TabSection key="choices" className="choices">
        <TabSectionHeader title="How would an expert answer this question?">
        </TabSectionHeader>
        <TabSectionContent key="explanation" className="feedback">
          <ExplanationEditor
            {...this.props}
            model={model.explanation}
            onEdit={(explanation, src) => this.onPartEdit(
              model.with({ explanation }),
              src)} />
        </TabSectionContent>
      </TabSection>
    );
  }
}
