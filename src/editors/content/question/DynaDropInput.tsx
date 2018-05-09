import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  Question, QuestionProps, QuestionState,
} from './Question';
import { TabContainer } from 'editors/content/common/TabContainer';
import { DynaDropTargetItems } from '../items/DynaDropTargetItems';
import { FillInTheBlank }
  from 'data/content/assessment/fill_in_the_blank';
import { Text } from '../items/Text';
import { Numeric } from '../items/Numeric';
import { ContentContainer } from 'editors/content/container//ContentContainer';
import { ActiveContext, TextSelection } from 'types/active';
import { EntityTypes } from '../../../data/content/learning/common';
import guid from 'utils/guid';
import './DynaDropInput.scss';
import { Button } from 'editors/content/common/Button';
import { ContiguousText } from 'data/content/learning/contiguous';

export type PartAddPredicate = (partToAdd: 'Numeric' | 'Text' | 'FillInTheBlank') => boolean;

export interface DynaDropInputProps
  extends QuestionProps<contentTypes.QuestionItem> {
  activeContext: ActiveContext;
  selectedInitiator: string;
  onAddItemPart: (item, part, body) => void;
}

export interface DynaDropInputState extends QuestionState {

}

/**
 * DynaDropInput Question Editor
 */
export class DynaDropInput extends Question<DynaDropInputProps, DynaDropInputState> {
  constructor(props: DynaDropInputProps) {
    super(props);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'dynadrop-input';
  }

  onInsertInputRef() {
    let result = null;

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
          data['$type'] = 'FillInTheBlank';

          const updated = (c as contentTypes.ContiguousText).addEntity(
            EntityTypes.input_ref, false, data, selection);

          result = [this.props.model.body.with({ content:
            this.props.model.body.content.set(updated.guid, updated),
          }), input];

        }

      });
    });

    return result;
  }

  onInsertFillInTheBlank(canInsertAnotherPart: PartAddPredicate) {
    const result = this.onInsertInputRef();

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
      onBodyEdit,
    } = this.props;

    return (
      <div className="question-body" key="question">
        <ContentContainer
          activeContentGuid={this.props.activeContentGuid}
          disableContentSelection={['Custom']}
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
    const { model, selectedInitiator, hideGradingCriteria, editMode, onRemove } = this.props;

    const itemIndex = model.items.toArray().findIndex(
      (i: FillInTheBlank) => i.id === selectedInitiator);

    if (itemIndex < 0) {
      // selectedInitiator does not exist in model.items
      return;
    }

    const item = model.items.toArray()[itemIndex] as FillInTheBlank;
    const part = model.parts.toArray()[itemIndex];

    return [(
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            item.id,
            'Skills',
            'Hints',
            ...(!hideGradingCriteria ? ['Criteria'] : []),
          ]}>

          <DynaDropTargetItems
              activeContentGuid={this.props.activeContentGuid}
              hover={this.props.hover}
              onUpdateHover={this.props.onUpdateHover}
              context={this.props.context}
              services={this.props.services}
              editMode={this.props.editMode}
              onRemove={this.props.onRemove}
              onItemFocus={this.props.onItemFocus}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
              itemModel={item}
              partModel={part}
              onEdit={this.props.onEdit} />

          {this.renderSkillsTab(item, part)}
          {this.renderHintsTab(item, part)}
          {!hideGradingCriteria ? this.renderGradingCriteriaTab(item, part) : null}
        </TabContainer>
      </div>
    )];
  }

}
