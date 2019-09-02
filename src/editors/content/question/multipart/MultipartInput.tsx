import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
  Question, QuestionProps, QuestionState,
} from '../question/Question';
import { TabContainer } from 'components/common/TabContainer';
import { FillInTheBlank } from '../../items/FillInTheBlank';
import { Text } from '../../items/Text';
import { Numeric } from '../../items/Numeric';
import { ContentContainer } from 'editors/content/container//ContentContainer';
import { ActiveContext, TextSelection } from 'types/active';
import guid from 'utils/guid';
import './MultipartInput.scss';
import { Button } from 'editors/content/common/Button';
import { ContiguousText } from 'data/content/learning/contiguous';
import { Badge } from '../../common/Badge';
import { ContentElement } from 'data/content/common/interfaces';
import { Maybe } from 'tsmonad';
import { RouterState } from 'reducers/router';
import { map } from 'data/utils/map';

export type PartAddPredicate = (partToAdd: 'Numeric' | 'Text' | 'FillInTheBlank') => boolean;

export interface MultipartInputProps
  extends QuestionProps<contentTypes.QuestionItem> {
  activeContext: ActiveContext;
  canInsertAnotherPart: PartAddPredicate;
  selectedInput: Maybe<string>;
  router: RouterState;
  setActiveItemIdActionAction: (activeItemId: string) => void;
  onClearSearchParam: (name) => void;
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

  componentDidMount() {
    this.setRoutedOrFirstItemActive();
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

          if (c instanceof contentTypes.ContiguousText) {

            const selection = activeContext.textSelection.caseOf({
              just: s => s,
              nothing: () =>
                TextSelection.createEmpty({}),
            });

            const input = guid();
            const data = {};
            data['@input'] = input;
            data['$type'] = type;

            const backingText = type === 'FillInTheBlank'
              ? ' Dropdown '
              : ' ' + type + ' ';

            const mapFn = (e: ContentElement) => {
              if (e.guid === c.guid) {
                return (c as contentTypes.ContiguousText).insertEntity(
                  EntityTypes.input_ref, false, data, selection, backingText);
              }
              return e;
            };

            result = [map(mapFn, this.props.body), input];

            this.props.setActiveItemIdActionAction(input);

          }

        });
      });
    }

    return result;
  }

  buildPartWithInitialResponse(match: string, input): contentTypes.Part {

    const correctFeedback = contentTypes.Feedback.fromText('Correct!', guid());
    const correctResponse = new contentTypes.Response().with({
      feedback: Immutable.OrderedMap<string, contentTypes.Feedback>()
        .set(correctFeedback.guid, correctFeedback),
      score: '1',
      input,
      match,
    });

    const otherFeedback = contentTypes.Feedback.fromText('Incorrect.', guid());
    const otherResponse = new contentTypes.Response().with({
      feedback: Immutable.OrderedMap<string, contentTypes.Feedback>()
        .set(otherFeedback.guid, otherFeedback),
      score: '0',
      input,
      match: '*',
    });

    return new contentTypes.Part().with({
      responses: Immutable.OrderedMap<string, contentTypes.Response>()
        .set(correctResponse.guid, correctResponse)
        .set(otherResponse.guid, otherResponse),
    });

  }

  onInsertNumeric(canInsertAnotherPart: PartAddPredicate) {
    const result = this.onInsertInputRef(canInsertAnotherPart, 'Numeric');

    if (Array.isArray(result) && result.length >= 2) {
      const item = new contentTypes.Numeric().with({ id: result[1] });
      const part = this.buildPartWithInitialResponse('0', result[1]);

      this.props.onAddItemPart(item, part, result[0]);
    }
  }

  onInsertText(canInsertAnotherPart: PartAddPredicate) {
    const result = this.onInsertInputRef(canInsertAnotherPart, 'Text');

    if (Array.isArray(result) && result.length >= 2) {
      const item = new contentTypes.Text().with({ id: result[1] });
      const part = this.buildPartWithInitialResponse('answer', result[1]);

      this.props.onAddItemPart(item, part, result[0]);
    }
  }

  onInsertFillInTheBlank(canInsertAnotherPart: PartAddPredicate) {
    const result = this.onInsertInputRef(canInsertAnotherPart, 'FillInTheBlank');

    if (Array.isArray(result) && result.length >= 2) {
      const item = new contentTypes.FillInTheBlank().with({ id: result[1] });
      const part = new contentTypes.Part();

      // values are formatted like guids without dashes in the DTD
      const value = guid().replace('-', '');
      const choice = contentTypes.Choice.fromText('', guid()).with({ value });
      const feedback = contentTypes.Feedback.fromText('', guid());
      let response = new contentTypes.Response().with({ match: value, input: result[1] });
      response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });

      const newItem = item.with({ choices: item.choices.set(choice.guid, choice) });
      const newPart = part.with({ responses: part.responses.set(response.guid, response) });

      this.props.onAddItemPart(newItem, newPart, result[0]);
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
