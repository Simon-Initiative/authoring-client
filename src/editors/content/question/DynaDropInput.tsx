import * as React from 'react';
import * as Immutable from 'immutable';
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
import { Initiator } from 'data/content/assessment/dragdrop/initiator';
import { Maybe } from 'tsmonad';
import { DndLayout } from 'data/content/assessment/dragdrop/dnd_layout';

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

    this.editInitiatorText = this.editInitiatorText.bind(this);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'dynadrop-input';
  }

  editInitiatorText(text: string, initiator: Initiator) {
    const { model, onEdit, selectedInitiator, onBodyEdit } = this.props;

    const customElement = (model.body.content.find(c =>
      c.contentType === 'Custom') as contentTypes.Custom);

    console.log('model.body', model.body)
    console.log('customElement', customElement)

    customElement.layoutData
      .lift(ld => ld.initiatorGroup.initiators)
      .lift(initiators => initiators.find(i => i.assessmentId === selectedInitiator))
      .lift((initiator) => {
        const updatedInitiator = initiator.with({
          text,
        });

        // update custom element in question body with the updated initiator
        const newCustomElement = customElement.withMutations(
            (custom: contentTypes.Custom) => custom.with({
              layoutData: custom.layoutData.caseOf({
                just: ld => Maybe.just<DndLayout>(ld.with({
                  initiatorGroup: ld.initiatorGroup.with({
                    initiators: ld.initiatorGroup.initiators.map(i =>
                      i.guid === updatedInitiator.guid ? updatedInitiator : i,
                    ) as Immutable.List<Initiator>,
                  }),
                })),
                nothing: () => Maybe.nothing<DndLayout>(),
              }),
            }),
          ) as contentTypes.Custom;

        // save updates
        onBodyEdit(model.body.with({
          content: model.body.content.set(newCustomElement.guid, newCustomElement),
        }));
      });
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

      // safeguard - return if selectedInitiator does not exist in model.items
    if (itemIndex < 0) {
      return;
    }

    const item = model.items.toArray()[itemIndex] as FillInTheBlank;
    const part = model.parts.toArray()[itemIndex];

    const initiator = (model.body.content.find(c =>
      c.contentType === 'Custom') as contentTypes.Custom)
      .layoutData
      .lift(ld => ld.initiatorGroup.initiators)
      .lift(initiators => initiators.find(i => i.assessmentId === selectedInitiator))
      .caseOf({
        just: initiator => initiator,
        nothing: () => undefined,
      });

    if (!initiator) {
      return;
    }

    return [(
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            initiator.text,
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
              initiator={initiator}
              onEditInitiatorText={this.editInitiatorText}
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
