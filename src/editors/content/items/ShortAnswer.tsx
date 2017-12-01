import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import {
  AbstractItemPartEditor,
  AbstractItemPartEditorProps,
} from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { CriteriaEditor } from '../question/CriteriaEditor';
import ConceptsEditor from '../concepts/ConceptsEditor.controller';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';
import { Question, QuestionProps, QuestionState,
Section, SectionContent, SectionHeader } from './Question';

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

  renderAdditionalSections() {
    const { editMode, itemModel, partModel } = this.props;

    return ([
      <Section key="choices" name="choices">
        <SectionHeader title="Options"/>
        <SectionContent>
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
        </SectionContent>
      </Section>,
    ]);
  }

}

