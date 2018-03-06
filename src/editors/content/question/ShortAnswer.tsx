import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Checkbox, Select, Button } from '../common/controls';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabSection, TabSectionContent, TabSectionHeader, TabOptionControl,
} from 'editors/content/common/TabContainer';
import { Feedback } from '../part/Feedback';

export interface ShortAnswerProps extends QuestionProps<contentTypes.ShortAnswer> {

}

export interface ShortAnswerState extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class ShortAnswer
  extends Question<ShortAnswerProps, ShortAnswerState> {

  constructor(props) {
    super(props);

    this.onPartEdit = this.onPartEdit.bind(this);
    this.onResponseAdd = this.onResponseAdd.bind(this);
    this.onWhitespaceChange = this.onWhitespaceChange.bind(this);
    this.onCaseSensitive = this.onCaseSensitive.bind(this);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'short-answer';
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  onResponseAdd() {
    const { partModel } = this.props;

    const feedback = new contentTypes.Feedback();
    const feedbacks = OrderedMap<string, contentTypes.Feedback>();

    const response = new contentTypes.Response({
      score: '0',
      match: '',
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel);
  }

  onWhitespaceChange(whitespace) {
    this.props.onEdit(this.props.itemModel.with({ whitespace }), this.props.partModel);
  }

  onCaseSensitive(caseSensitive) {
    this.props.onEdit(this.props.itemModel.with({ caseSensitive }), this.props.partModel);
  }

  renderDetails() {
    const {
      partModel,
      editMode,
    } = this.props;

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Details"/>
          <TabSectionContent>
            <div style={{ display: 'inline' }}>
              <Select
                editMode={this.props.editMode}
                label="Whitespace"
                value={this.props.itemModel.whitespace}
                onChange={this.onWhitespaceChange}>
                <option value="preserve">Preserve</option>
                <option value="trim">Trim</option>
                <option value="normalize">Normalize</option>
              </Select>

              <Checkbox
                editMode={this.props.editMode}
                label="Case Sensitive"
                value={this.props.itemModel.caseSensitive}
                onEdit={this.onCaseSensitive} />
            </div>
          </TabSectionContent>
          <TabSectionHeader title="Feedback">
            <TabOptionControl key="add-feedback" name="Add Feedback" hideLabel>
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
      </React.Fragment>
    );
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }

}

