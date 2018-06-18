import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Button } from '../common/controls';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabSection, TabSectionContent, TabSectionHeader, TabOptionControl,
} from 'editors/content/common/TabContainer';
import { Feedback } from '../part/Feedback';
import guid from 'utils/guid';

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
      editMode,
    } = this.props;

    return (
      <TabSection key="choices" className="choices">
        <TabSectionHeader title="Feedback">
          <TabOptionControl name="add-feedback">
            <Button
              editMode={editMode}
              type="link"
              onClick={this.onResponseAdd}>
              Add Feedback
            </Button>
          </TabOptionControl>
        </TabSectionHeader>
        <TabSectionContent key="feedback" className="feedback">
          <Feedback
            {...this.props}
            model={partModel}
            onEdit={this.onPartEdit} />
        </TabSectionContent>
      </TabSection>
    );
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }
}
