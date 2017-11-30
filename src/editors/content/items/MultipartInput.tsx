import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
// import * as Immutable from 'immutable';
// import { AppServices } from '../../common/AppServices';
import {
//   AbstractItemPartEditor,
  AbstractItemPartEditorProps,
} from '../common/AbstractItemPartEditor';
// import { Choice } from './Choice';
// import { ExplanationEditor } from '../part/ExplanationEditor';
// import { TabularFeedback } from '../part/TabularFeedback';
// import { Hints } from '../part/Hints';
// import { ItemLabel } from './ItemLabel';
// import { CriteriaEditor } from '../question/CriteriaEditor';
// import ConceptsEditor from '../concepts/ConceptsEditor.controller';
// import { TextInput, InlineForm, InputLabel, Button, Checkbox, Collapse }
// from '../common/controls';
import { Select } from '../common/controls';
// import guid from 'utils/guid';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { HtmlToolbarButton } from '../html/TypedToolbar';
import { InsertInputRefCommand } from '../question/commands';
import { Dropdown, DropdownItem } from 'editors/content/common/Dropdown.tsx';
import { CommandProcessor } from '../common/command';
import { EditorState } from 'draft-js';

import './MultipartInput.scss';
import './QuestionBody.scss';

export interface MultipartInputProps
  extends AbstractItemPartEditorProps<any> {
  onBodyEdit: (...args: any[]) => any;
  body: any;

  grading: any;
  onGradingChange: (value) => void;
  hideGradingCriteria: boolean;

  fillInTheBlankCommand: InsertInputRefCommand;
  numericCommand: InsertInputRefCommand;
  textCommand: InsertInputRefCommand;
  canInsertAnotherPart: (e: any) => void;
}

export interface MultipartInputState {

}

let htmlEditor: CommandProcessor<EditorState>;

const onInsertNumeric = (e, numericCommand, canInsertAnotherPart) => {
  e.preventDefault();
  if (canInsertAnotherPart()) {
    htmlEditor.process(numericCommand);
  }
};

const onInsertText = (e, textCommand, canInsertAnotherPart) => {
  e.preventDefault();
  if (canInsertAnotherPart()) {
    htmlEditor.process(textCommand);
  }
};

const onInsertFillInTheBlank = (e, fillInTheBlankCommand, canInsertAnotherPart) => {
  e.preventDefault();
  if (canInsertAnotherPart()) {
    htmlEditor.process(fillInTheBlankCommand);
  }
};

// type SectionHeaderProps = {
//   name: string;
//   children: React.Component[];
// };

export const SectionHeader = props => (
  <div className={`section-header ${props.name}`}>
    <h3>{props.name}</h3>
    <div className="flex-spacer" />
    {props.children}
  </div>
);

// type SectionContentProps = {
//   children: React.Component[];
// };
// export type SectionContent = React.SFC<SectionContentProps>;
export const SectionContent = ({ children }) => (
  <div className={`section-content ${name}`}>{children}</div>
);

export const Section = ({ name, children }) => (
  <div key={name} className={`section ${name}`}>{children}</div>
);

/**
 * The content editor for HtmlContent.
 */
export class MultipartInput extends React.PureComponent<MultipartInputProps, MultipartInputState> {
  constructor(props) {
    super(props);
  }

  renderOptions() {
    const { editMode, grading, onGradingChange } = this.props;

    return (
      <div className="options">
        <div className="control grading">
          <div className="control-label">Grading</div>
          <Select
            editMode={editMode}
            label=""
            value={grading}
            onChange={onGradingChange}>
            <option value="automatic">Automatic</option>
            <option value="instructor">Instructor</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </div>
      </div>
    );
  }

  renderQuestionSection() {
    const {
      editMode,
      services,
      context,
      body,
      numericCommand,
      textCommand,
      fillInTheBlankCommand,
      canInsertAnotherPart,
      onBodyEdit,
    } = this.props;

    const bodyStyle = {
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: '1px',
      borderColor: '#AAAAAA',
    };

    const multipartButtons = [
      <HtmlToolbarButton
        tooltip="Insert Dropdown"
        key="server"
        icon="server"
        command={fillInTheBlankCommand}/>,
      <HtmlToolbarButton
        tooltip="Insert Numeric Input"
        key="info"
        icon="info"
        command={numericCommand}/>,
      <HtmlToolbarButton
        tooltip="Insert Text Input"
        key="i-cursor"
        icon="i-cursor"
        command={textCommand}/>,
    ];

    const insertionToolbar =
      <InlineInsertionToolbar>
        {multipartButtons}
      </InlineInsertionToolbar>;

    return (
      <Section name="question">
        <SectionHeader name="Question">
          <div className="control insert-item">
            <Dropdown label="Insert Item">
              <DropdownItem
                label="Numeric"
                onClick={e =>
                  onInsertNumeric(e, numericCommand, canInsertAnotherPart)
                }/>
              <DropdownItem
                label="Text"
                onClick={e =>
                  onInsertText(e, textCommand, canInsertAnotherPart)
                }/>
              <DropdownItem
                label="Dropdown"
                onClick={e =>
                  onInsertFillInTheBlank(e, fillInTheBlankCommand, canInsertAnotherPart)
                }/>
            </Dropdown>
          </div>
        </SectionHeader>
        <SectionContent>
          <HtmlContentEditor
            ref={c => htmlEditor = c}
            editMode={editMode}
            services={services}
            context={context}
            editorStyles={bodyStyle}
            inlineToolbar={<InlineToolbar/>}
            inlineInsertionToolbar={insertionToolbar}
            blockToolbar={<BlockToolbar/>}
            model={body}
            onEdit={onBodyEdit} />
          </SectionContent>
      </Section>
    );
  }

  renderAdditionalSections() {
    return [];
  }

  renderSections() {
    return [
      this.renderQuestionSection(),
      ...this.renderAdditionalSections(),
    ];
  }

  render() {
    const {
      itemModel,
      onFocus,
      onBlur,
    } = this.props;

    return (
      <div
        className="multipart-input item-content-tab"
        onFocus={() => onFocus(itemModel.id)}
        onBlur={() => onBlur(itemModel.id)}>

        {this.renderOptions()}
        {this.renderSections()}
      </div>
    );
  }
}
