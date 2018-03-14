import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { InsertInputRefCommand } from '../question/commands';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import { TabContainer } from 'editors/content/common/TabContainer';
import { FillInTheBlank } from '../items/FillInTheBlank';
import { Text } from '../items/Text';
import { Numeric } from '../items/Numeric';
import { ContentContainer } from 'editors/content/container//ContentContainer';

import './MultipartInput.scss';
import { Button } from 'editors/content/common/Button';

type PartAddPredicate = (partToAdd: 'Numeric' | 'Text' | 'FillInTheBlank') => boolean;

export interface MultipartInputProps
  extends QuestionProps<contentTypes.QuestionItem> {
  fillInTheBlankCommand: InsertInputRefCommand;
  numericCommand: InsertInputRefCommand;
  textCommand: InsertInputRefCommand;
  canInsertAnotherPart: PartAddPredicate;
}

export interface MultipartInputState extends QuestionState {

}

/**
 * Multipart Question Editor
 */
export class MultipartInput extends Question<MultipartInputProps, MultipartInputState> {
  constructor(props: MultipartInputProps) {
    super(props);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'multipart-input';
  }

  onInsertNumeric(numericCommand, canInsertAnotherPart: PartAddPredicate) {
    if (canInsertAnotherPart('Numeric')) {
      this.htmlEditor.process(numericCommand);
    }
  }

  onInsertText(textCommand, canInsertAnotherPart: PartAddPredicate) {
    if (canInsertAnotherPart('Text')) {
      this.htmlEditor.process(textCommand);
    }
  }

  onInsertFillInTheBlank(fillInTheBlankCommand, canInsertAnotherPart: PartAddPredicate) {
    if (canInsertAnotherPart('FillInTheBlank')) {
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

    return (
      <div className="question-body" key="question">
        <div className="control insert-item">
            <span>Insert:</span>
            <button className="btn btn-sm btn-link" type="button"
              disabled={!this.props.editMode || !canInsertAnotherPart('Numeric')}
              onClick={() => this.onInsertNumeric(numericCommand, canInsertAnotherPart)}>
              Numeric
            </button>
            <button className="btn btn-sm btn-link" type="button"
              disabled={!this.props.editMode || !canInsertAnotherPart('Text')}
              onClick={() => this.onInsertText(textCommand, canInsertAnotherPart)}>
              Text
            </button>
            <button className="btn btn-sm btn-link" type="button"
              disabled={!this.props.editMode || !canInsertAnotherPart('FillInTheBlank')}
              onClick={() => this.onInsertFillInTheBlank(
                fillInTheBlankCommand, canInsertAnotherPart)}>
              Dropdown
            </button>

        </div>
        <ContentContainer
          onFocus={this.props.onFocus}
          editMode={editMode}
          services={services}
          context={context}
          model={body}
          onEdit={onBodyEdit} />
      </div>
    );
  }

  renderItemParts(): JSX.Element[] {
    const { model, hideGradingCriteria, editMode, onRemove } = this.props;
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
              onItemFocus={props.onItemFocus}
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
              onItemFocus={props.onItemFocus}
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
              onItemFocus={props.onItemFocus}
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
          ]}
          controls={[
            <Button
                type="link"
                className="btn-remove"
                editMode={editMode}
                onClick={() => onRemove(item, parts[index])}>
              <i className="fa fa-trash" /> Remove
            </Button>,
          ]}>

          {getTabFromContentType(item, parts[index], this.props)}
          {this.renderSkillsTab(item, parts[index])}
          {this.renderHintsTab(item, parts[index])}
          {!hideGradingCriteria ? this.renderGradingCriteriaTab(item, parts[index]) : null}
        </TabContainer>
      </div>
    ));
  }

}
