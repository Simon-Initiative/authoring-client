import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { HtmlToolbarButton } from '../html/TypedToolbar';
import { InsertInputRefCommand } from '../question/commands';
import { Dropdown, DropdownItem } from 'editors/content/common/Dropdown.tsx';
import { TabContainer } from 'editors/content/common/TabContainer';
import { Question, QuestionProps, QuestionState,
  Section, SectionHeader, SectionContent, Tab } from './Question';
import { FillInTheBlank } from '../items/FillInTheBlank';
import { Text } from '../items/Text';
import { Numeric } from '../items/Numeric';

import './MultipartInput.scss';

export interface MultipartInputProps
  extends QuestionProps<contentTypes.QuestionItem> {
  fillInTheBlankCommand: InsertInputRefCommand;
  numericCommand: InsertInputRefCommand;
  textCommand: InsertInputRefCommand;
  canInsertAnotherPart: (e: any) => void;
}

export interface MultipartInputState extends QuestionState {

}

/**
 * Multipart Question Editor
 */
export class MultipartInput extends Question<MultipartInputProps, MultipartInputState> {
  constructor(props) {
    super(props);
    this.setClassname('multipart-input');
  }

  onInsertNumeric(numericCommand, canInsertAnotherPart) {
    if (canInsertAnotherPart()) {
      this.htmlEditor.process(numericCommand);
    }
  }

  onInsertText(textCommand, canInsertAnotherPart) {
    if (canInsertAnotherPart()) {
      this.htmlEditor.process(textCommand);
    }
  }

  onInsertFillInTheBlank(fillInTheBlankCommand, canInsertAnotherPart) {
    if (canInsertAnotherPart()) {
      this.htmlEditor.process(fillInTheBlankCommand);
    }
  }

  /**
   * Override parent renderQuestionSection function
   */
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
      <Section className="question" key="question">
        <SectionHeader title="Question">
          <div className="control insert-item">
              Insert:&nbsp;&nbsp;
              <button className="btn btn-sm btn-link" type="button"
                onClick={() => this.onInsertNumeric(numericCommand, canInsertAnotherPart)}>
                Numeric
              </button>
              &nbsp;&nbsp;
              <button className="btn btn-sm btn-link" type="button"
                onClick={() => this.onInsertText(textCommand, canInsertAnotherPart)}>
                Text
              </button>
              &nbsp;&nbsp;
              <button className="btn btn-sm btn-link" type="button"
                onClick={() => this.onInsertFillInTheBlank(
                  fillInTheBlankCommand, canInsertAnotherPart)}>
                Dropdown
              </button>

          </div>
        </SectionHeader>
        <SectionContent>
          <HtmlContentEditor
            ref={c => this.htmlEditor = c}
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

  renderItemParts(): JSX.Element[] {
    const { model, hideGradingCriteria } = this.props;
    const items = model.items.toArray();
    const parts = model.parts.toArray();

    const getTabNameFromContentType = (contentType, index) => {
      switch (contentType) {
        case 'FillInTheBlank':
          return `Dropdown Item ${index}`;
        case 'Number':
          return `Number Item ${index}`;
        case 'Text':
        default:
          return `Text Item ${index}`;
      }
    };

    const getTabFromContentType = (contentType, props) => {
      switch (contentType) {
        case 'FillInTheBlank':
          return (
            <FillInTheBlank
              context={props.context}
              services={props.services}
              editMode={props.editMode}
              onRemove={props.onRemove}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              itemModel={props.itemModel}
              partModel={props.partModel}
              onEdit={props.onEdit} />
          );
        case 'Number':
          return (
            <Numeric
              context={props.context}
              services={props.services}
              editMode={props.editMode}
              onRemove={props.onRemove}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              itemModel={props.itemModel}
              partModel={props.partModel}
              onEdit={props.onEdit} />
          );
        case 'Text':
        default:
          return (
            <Text
              context={props.context}
              services={props.services}
              editMode={props.editMode}
              onRemove={props.onRemove}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              itemModel={props.itemModel}
              partModel={props.partModel}
              onEdit={props.onEdit} />
          );
      }
    };

    return items.map((item, index) => (
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            getTabNameFromContentType(item.contentType, index + 1),
            'Skills',
            'Hints',
            ...(!hideGradingCriteria ? ['Criteria'] : []),
            'Other',
          ]}>

          {getTabFromContentType(item.contentType, this.props)}
          {this.renderSkillsTab(item, parts[index])}
          {this.renderHintsTab(item, parts[index])}
          {!hideGradingCriteria ? this.renderGradingCriteriaTab(item, parts[index]) : null}
          {this.renderOtherTab(item, parts[index])}
        </TabContainer>
      </div>
    ));
  }

}
