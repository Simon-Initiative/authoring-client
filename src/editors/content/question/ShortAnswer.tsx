import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { Checkbox, Select } from '../common/controls';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabContainer, Tab, TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';

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

    this.setClassname('short-answer');

    this.onWhitespaceChange = this.onWhitespaceChange.bind(this);
    this.onCaseSensitive = this.onCaseSensitive.bind(this);
  }

  onWhitespaceChange(whitespace) {
    this.props.onEdit(this.props.itemModel.with({ whitespace }), this.props.partModel);
  }

  onCaseSensitive(caseSensitive) {
    this.props.onEdit(this.props.itemModel.with({ caseSensitive }), this.props.partModel);
  }

  renderDetails() {
    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Options"/>
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
        </TabSection>
      </React.Fragment>
    );
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }

}

