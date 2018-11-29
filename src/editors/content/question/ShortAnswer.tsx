import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { Select } from '../common/controls';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabSection, TabSectionContent, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { ExplanationEditor } from 'editors/content/part/ExplanationEditor';
import { BranchSelect } from '../common/BranchSelect';

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
    this.onWhitespaceChange = this.onWhitespaceChange.bind(this);
    this.onToggleCaseSensitive = this.onToggleCaseSensitive.bind(this);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'short-answer';
  }

  onPartEdit(partModel: contentTypes.Part, src) {
    this.props.onEdit(this.props.itemModel, partModel, src);
  }

  onWhitespaceChange(whitespace) {
    this.props.onEdit(this.props.itemModel.with({ whitespace }), this.props.partModel, null);
  }

  onToggleCaseSensitive() {
    const { itemModel, partModel, onEdit } = this.props;

    const caseSensitive = !itemModel.caseSensitive;

    onEdit(itemModel.with({ caseSensitive }), partModel, null);
  }

  renderDetails() {
    const { partModel, itemModel, editMode, branchingQuestions } = this.props;

    const response = partModel.responses.first() || new contentTypes.Response();
    const feedback = response.feedback.first() || new contentTypes.Feedback();

    const branchSelect = branchingQuestions.caseOf({
      just: qs => <BranchSelect
        editMode={editMode}
        value={feedback.lang}
        onChange={lang => this.onPartEdit(
          partModel.with({
            responses: partModel.responses.set(
              response.guid, response.with({
                feedback: response.feedback.set(feedback.guid, feedback.with({ lang })),
              })),
          }),
          null)}
        questions={qs}
      />,
      nothing: () => null,
    });

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Details" />
          <TabSectionContent>
            <div style={{ display: 'inline' }}>
              <Select
                editMode={editMode}
                label="Whitespace"
                value={itemModel.whitespace}
                onChange={this.onWhitespaceChange}>
                <option value="preserve">Preserve</option>
                <option value="trim">Trim</option>
                <option value="normalize">Normalize</option>
              </Select>

              <ToggleSwitch
                editMode={editMode}
                checked={itemModel.caseSensitive}
                label="Case Sensitive"
                onClick={this.onToggleCaseSensitive} />
            </div>
          </TabSectionContent>
          <TabSectionHeader title="How would an expert answer this question?">
          </TabSectionHeader>
          {/* All question types except short answers and essays use feedback.
          Short answers and essays use the explanation instead */}
          <TabSectionContent key="explanation" className="feedback">
            {branchSelect}
            <ExplanationEditor
              {...this.props}
              model={partModel.explanation}
              onEdit={(explanation, src) => this.onPartEdit(
                partModel.with({ explanation }),
                src)} />
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
