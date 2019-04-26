import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
  Question, QuestionProps, QuestionState,
} from 'editors/content/question/question/Question';
import {
  TabSection, TabSectionContent, TabSectionHeader,
} from 'components/common/TabContainer';
import guid from 'utils/guid';
import { ExplanationEditor } from 'editors/content/part/ExplanationEditor';

export interface EssayProps extends QuestionProps<contentTypes.Essay> {

}

export interface EssayState extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class Essay
  extends Question<EssayProps, EssayState> {

  constructor(props) {
    super(props);

    this.onPartEdit = this.onPartEdit.bind(this);
    this.onResponseAdd = this.onResponseAdd.bind(this);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'essay';
  }

  onPartEdit(partModel: contentTypes.Part, src) {
    this.props.onEdit(this.props.itemModel, partModel, src);
  }

  onResponseAdd() {
    const { partModel } = this.props;

    const feedback = contentTypes.Feedback.fromText('', guid());
    const feedbacks = OrderedMap<string, contentTypes.Feedback>();

    const response = new contentTypes.Response({
      score: '0',
      match: '',
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel, feedback);
  }

  renderDetails() {
    const {
      partModel,
    } = this.props;

    return (
      <TabSection key="choices" className="choices">
        <TabSectionHeader title="Feedback">
        </TabSectionHeader>
        <TabSectionContent key="explanation" className="feedback">
          {/* All question types except short answers and essays use feedback.
          Short answers and essays use the explanation instead */}
          <div className="instruction-label">How would an expert answer this question?</div>
          <ExplanationEditor
            {...this.props}
            model={partModel.explanation}
            onEdit={(explanation, src) => this.onPartEdit(
              partModel.with({ explanation }),
              src)} />
        </TabSectionContent>
      </TabSection>
    );
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }
}
