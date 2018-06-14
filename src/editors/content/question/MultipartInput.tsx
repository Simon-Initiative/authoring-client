import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import { TabContainer } from 'editors/content/common/TabContainer';
import { FillInTheBlank } from '../items/FillInTheBlank';
import { Text } from '../items/Text';
import { Numeric } from '../items/Numeric';
import { ContentContainer } from 'editors/content/container//ContentContainer';
import { ActiveContext, TextSelection } from 'types/active';
import { EntityTypes } from '../../../data/content/learning/common';
import guid from 'utils/guid';
import './MultipartInput.scss';
import { Button } from 'editors/content/common/Button';
import { ContiguousText } from 'data/content/learning/contiguous';

export type PartAddPredicate = (partToAdd: 'Numeric' | 'Text' | 'FillInTheBlank') => boolean;

export interface MultipartInputProps
  extends QuestionProps<contentTypes.QuestionItem> {
  activeContext: ActiveContext;
  canInsertAnotherPart: PartAddPredicate;
  onAddItemPart: (item, part, body) => void;
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

  onInsertInputRef(
    canInsertAnotherPart: PartAddPredicate,
    type: 'FillInTheBlank' | 'Numeric' | 'Text') {

    let result = null;

    if (canInsertAnotherPart(type)) {

      const { activeContext } = this.props;

      activeContext.container.lift((p) => {
        activeContext.activeChild.lift((c) => {

          if (this.props.model.body.content.has((c as any).guid)
            && (c instanceof contentTypes.ContiguousText)) {

            const selection = activeContext.textSelection.caseOf({
              just: s => s,
              nothing: () =>
                TextSelection.createEmpty((c as ContiguousText).content.getFirstBlock().getKey()),
            });

            const input = guid();
            const data = {};
            data['@input'] = input;
            data['$type'] = type;

            const backingText = type === 'FillInTheBlank'
              ? ' Dropdown '
              : ' ' + type + ' ';

            const updated = (c as contentTypes.ContiguousText).insertEntity(
              EntityTypes.input_ref, false, data, selection, backingText);

            result = [this.props.model.body.with({ content:
              this.props.model.body.content.set(updated.guid, updated),
            }), input];

          }

        });
      });
    }

    return result;
  }

  onInsertNumeric(canInsertAnotherPart: PartAddPredicate) {
    const result = this.onInsertInputRef(canInsertAnotherPart, 'Numeric');

    if (result !== null) {
      const item = new contentTypes.Numeric().with({ id: result[1] });
      const part = new contentTypes.Part();
      this.props.onAddItemPart(item, part, result[0]);
    }
  }

  onInsertText(canInsertAnotherPart: PartAddPredicate) {
    const result = this.onInsertInputRef(canInsertAnotherPart, 'Text');

    if (result !== null) {
      const item = new contentTypes.Text().with({ id: result[1] });
      const part = new contentTypes.Part();
      this.props.onAddItemPart(item, part, result[0]);
    }
  }

  onInsertFillInTheBlank(canInsertAnotherPart: PartAddPredicate) {
    const result = this.onInsertInputRef(canInsertAnotherPart, 'FillInTheBlank');

    if (result !== null) {
      const item = new contentTypes.FillInTheBlank().with({ id: result[1] });
      const part = new contentTypes.Part();
      this.props.onAddItemPart(item, part, result[0]);
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
      canInsertAnotherPart,
      onBodyEdit,
    } = this.props;

    return (
      <div className="question-body" key="question">
        <div className="control insert-item">
            <span>Insert:</span>
            <button className="btn btn-sm btn-link" type="button"
              disabled={!this.props.editMode || !canInsertAnotherPart('Numeric')}
              onClick={() => this.onInsertNumeric(canInsertAnotherPart)}>
              Numeric
            </button>
            <button className="btn btn-sm btn-link" type="button"
              disabled={!this.props.editMode || !canInsertAnotherPart('Text')}
              onClick={() => this.onInsertText(canInsertAnotherPart)}>
              Text
            </button>
            <button className="btn btn-sm btn-link" type="button"
              disabled={!this.props.editMode || !canInsertAnotherPart('FillInTheBlank')}
              onClick={() => this.onInsertFillInTheBlank(canInsertAnotherPart)}>
              Dropdown
            </button>

        </div>
        <ContentContainer
          activeContentGuid={this.props.activeContentGuid}
          hover={this.props.hover}
          onUpdateHover={this.props.onUpdateHover}
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
              activeContentGuid={this.props.activeContentGuid}
              hover={this.props.hover}
              onUpdateHover={this.props.onUpdateHover}
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
              activeContentGuid={this.props.activeContentGuid}
              hover={this.props.hover}
              onUpdateHover={this.props.onUpdateHover}
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
              activeContentGuid={this.props.activeContentGuid}
              hover={this.props.hover}
              onUpdateHover={this.props.onUpdateHover}
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
