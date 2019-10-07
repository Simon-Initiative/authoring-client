import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  Question, QuestionProps, QuestionState,
} from '../question/Question';
import { TabContainer } from 'components/common/TabContainer';
import { FillInTheBlank } from '../../items/FillInTheBlank';
import { Text } from '../../items/Text';
import { Numeric } from '../../items/Numeric';
import { ContentContainer } from 'editors/content/container//ContentContainer';
import guid from 'utils/guid';
import './MultipartInput.scss';
import { Button } from 'editors/content/common/Button';
import { InputRefType } from 'data/content/learning/input_ref';
import { Badge } from '../../common/Badge';
import { Maybe } from 'tsmonad';
import { RouterState } from 'reducers/router';
import { Editor } from 'slate';
import { InlineTypes } from 'data/content/learning/contiguous';
import * as editorUtils from 'editors/content/learning/contiguoustext/utils';

export type PartAddPredicate = (partToAdd: 'Numeric' | 'Text' | 'FillInTheBlank') => boolean;

export interface MultipartInputProps
  extends QuestionProps<contentTypes.QuestionItem> {
  canInsertAnotherPart: PartAddPredicate;
  selectedInput: Maybe<string>;
  router: RouterState;
  setActiveItemIdActionAction: (activeItemId: string) => void;
  onClearSearchParam: (name) => void;
  onInsertInputRef: (inputRef: contentTypes.InputRef) => void;
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

  componentDidMount() {
    super.componentDidMount();
    this.setRoutedOrFirstItemActive();
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'multipart-input';
  }

  onInsertInputRef(
    canInsertAnotherPart: PartAddPredicate,
    type: 'FillInTheBlank' | 'Numeric' | 'Text') {

    if (canInsertAnotherPart(type)) {

      const input = guid();

      let inputType = InputRefType.Numeric;
      if (type === 'FillInTheBlank') {
        inputType = InputRefType.FillInTheBlank;
      } else if (type === 'Text') {
        inputType = InputRefType.Text;
      }

      const inputRef = new contentTypes.InputRef({ input, inputType });
      this.props.onInsertInputRef(inputRef);
    }

  }


  setRoutedOrFirstItemActive = () => {
    const { model, router, setActiveItemIdActionAction, onClearSearchParam } = this.props;

    if (router.params.has('partId')) {
      const partId = router.params.get('partId');
      const index = model.parts.toList().findIndex(part => part.id === partId);
      const items = model.items.toList();
      const item = items.get(index);

      if (index > -1 && item && item.contentType !== 'Unsupported') {
        setActiveItemIdActionAction(item.id);
      } else {
        this.setFirstItemActive();
      }

      onClearSearchParam('partId');
    } else {
      this.setFirstItemActive();
    }
  }

  setFirstItemActive = () => {
    const { model, setActiveItemIdActionAction } = this.props;

    const firstItem = model.items.first();
    if (firstItem && firstItem.contentType !== 'Unsupported') {
      setActiveItemIdActionAction(firstItem.id);
    } else {
      setActiveItemIdActionAction(null);
    }
  }

  onRemove = (item: contentTypes.QuestionItem, part: contentTypes.Part) => {
    const { onRemove } = this.props;

    onRemove(item, part);

    this.setFirstItemActive();
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
      setActiveItemIdActionAction,
      selectedInput,
    } = this.props;

    const onEntitySelected = (key: string, data: Object) => {
      setActiveItemIdActionAction(data['@input']);
    };

    return (
      <div className="question-body" key="question">
        <div className="control insert-item">
          <span>Insert:</span>
          <button className="btn btn-sm btn-link" type="button"
            disabled={!this.props.editMode || !canInsertAnotherPart('Numeric')}
            onClick={this.onInsertInputRef.bind(this, canInsertAnotherPart, 'Numeric')}>
            Numeric
            </button>
          <button className="btn btn-sm btn-link" type="button"
            disabled={!this.props.editMode || !canInsertAnotherPart('Text')}
            onClick={() => this.onInsertInputRef(canInsertAnotherPart, 'Text')}>
            Text
            </button>
          <button className="btn btn-sm btn-link" type="button"
            disabled={!this.props.editMode || !canInsertAnotherPart('FillInTheBlank')}
            onClick={() => this.onInsertInputRef(canInsertAnotherPart, 'FillInTheBlank')}>
            Dropdown
            </button>

        </div>
        <ContentContainer
          onEntitySelected={onEntitySelected}
          activeContentGuid={this.props.activeContentGuid}
          hover={this.props.hover}
          onUpdateHover={this.props.onUpdateHover}
          onFocus={this.props.onFocus}
          editMode={editMode}
          services={services}
          context={context}
          selectedEntity={selectedInput}
          model={body}
          onEdit={onBodyEdit} />
      </div>
    );
  }

  renderItemParts(): JSX.Element[] {
    const { model, selectedInput, hideGradingCriteria, editMode } = this.props;
    const items = model.items.toArray();
    const parts = model.parts.toArray();

    const getTabNameFromContentType = (item: contentTypes.QuestionItem) => {
      switch (item.contentType) {
        case 'FillInTheBlank':
          return 'Dropdown';
        case 'Numeric':
          return 'Numeric';
        case 'Text':
        default:
          return 'Text';
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
              onRemove={this.onRemove}
              onItemFocus={props.onItemFocus}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              itemModel={item}
              partModel={part}
              branchingQuestions={this.props.branchingQuestions}
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
              onRemove={this.onRemove}
              onFocus={props.onFocus}
              onItemFocus={props.onItemFocus}
              onBlur={props.onBlur}
              itemModel={item}
              partModel={part}
              branchingQuestions={this.props.branchingQuestions}
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
              onRemove={this.onRemove}
              onFocus={props.onFocus}
              onItemFocus={props.onItemFocus}
              onBlur={props.onBlur}
              itemModel={item}
              partModel={part}
              branchingQuestions={this.props.branchingQuestions}
              onEdit={props.onEdit} />
          );
      }
    };

    const renderSkillsLabel = (part: contentTypes.Part) => (
      <span>Skills <Badge color={part.skills.size > 0 ? '#2ecc71' : '#e74c3c'}>
        {part.skills.size}
      </Badge>
      </span>
    );

    return selectedInput.caseOf({
      just: selectedInput => items
        .filter(i => i.contentType !== 'Unsupported' && i.id === selectedInput)
        .map((item) => {
          const index = items.findIndex(i => i.contentType !== 'Unsupported'
            && i.id === selectedInput);

          return (
            <div key={item.guid} className="item-part-editor">
              <TabContainer
                labels={[
                  getTabNameFromContentType(item),
                  renderSkillsLabel(parts[index]),
                  'Hints',
                  ...(!hideGradingCriteria ? ['Criteria'] : []),
                  ...(this.renderAnalytics(index) ? [this.renderAnalyticsLabel(index)] : []),
                ]}
                controls={[
                  <Button
                    type="link"
                    className="btn-remove"
                    editMode={editMode}
                    onClick={() => this.onRemove(item, parts[index])}>
                    <i className="fas fa-trash" /> Remove Item
                  </Button>,
                ]}>

                {getTabFromContentType(item, parts[index], this.props)}
                {this.renderSkillsTab(item, parts[index])}
                {this.renderHintsTab(item, parts[index])}
                {!hideGradingCriteria ? this.renderGradingCriteriaTab(item, parts[index]) : null}
                {this.renderAnalytics() ? this.renderAnalytics(index) : null}
              </TabContainer>
            </div>
          );
        }),
      nothing: () => [],
    });
  }

}
