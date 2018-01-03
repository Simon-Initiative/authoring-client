import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { HtmlToolbarButton } from '../html/TypedToolbar';
import { InsertInputRefCommand } from '../question/commands';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabContainer, Tab, TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
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
  constructor(props: MultipartInputProps) {
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

  /** Implement parent absract methods */
  renderDetails() {
    // we are rendering our own details tabs,
    // therefore do not render the parent details tab
    return false;
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
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
      <div className="question" key="question">
        <div className="control insert-item">
            <span>Insert:</span>
            <button className="btn btn-sm btn-link" type="button"
              onClick={() => this.onInsertNumeric(numericCommand, canInsertAnotherPart)}>
              Numeric
            </button>
            <button className="btn btn-sm btn-link" type="button"
              onClick={() => this.onInsertText(textCommand, canInsertAnotherPart)}>
              Text
            </button>
            <button className="btn btn-sm btn-link" type="button"
              onClick={() => this.onInsertFillInTheBlank(
                fillInTheBlankCommand, canInsertAnotherPart)}>
              Dropdown
            </button>

        </div>
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
      </div>
    );
  }

  renderItemParts(): JSX.Element[] {
    const { model, hideGradingCriteria } = this.props;
    const items = model.items.toArray();
    const parts = model.parts.toArray();

    const getTabNameFromContentType = (item: contentTypes.QuestionItem, index) => {
      switch (item.contentType) {
        case 'FillInTheBlank':
          return `Dropdown Item ${index}`;
        case 'Numeric':
          return `Numeric Item ${index}`;
        case 'Text':
        default:
          return `Text Item ${index}`;
      }
    };

    const getTabFromContentType = (
      item: contentTypes.QuestionItem,
      part: contentTypes.Part,
      props) => {
      switch (item.contentType) {
        case 'FillInTheBlank':
          return (
            <FillInTheBlank
              context={props.context}
              services={props.services}
              editMode={props.editMode}
              onRemove={props.onRemove}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              itemModel={item}
              partModel={part}
              onEdit={props.onEdit} />
          );
        case 'Numeric':
          return (
            <Numeric
              context={props.context}
              services={props.services}
              editMode={props.editMode}
              onRemove={props.onRemove}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              itemModel={item}
              partModel={part}
              onEdit={props.onEdit} />
          );
        case 'Text':
          return (
            <Text
              context={props.context}
              services={props.services}
              editMode={props.editMode}
              onRemove={props.onRemove}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              itemModel={item}
              partModel={part}
              onEdit={props.onEdit} />
          );
      }
    };

    return items.map((item, index) => (
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            getTabNameFromContentType(item, index + 1),
            'Skills',
            'Hints',
            ...(!hideGradingCriteria ? ['Criteria'] : []),
            'Other',
          ]}>

          {getTabFromContentType(item, parts[index], this.props)}
          {this.renderSkillsTab(item, parts[index])}
          {this.renderHintsTab(item, parts[index])}
          {!hideGradingCriteria ? this.renderGradingCriteriaTab(item, parts[index]) : null}
          {this.renderOtherTab(item, parts[index])}
        </TabContainer>
      </div>
    ));
  }

}
