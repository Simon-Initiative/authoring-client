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
import { ContentContainer } from 'editors/content/container//ContentContainer';
import { ActiveContext } from 'types/active';
import guid from 'utils/guid';
import './DynaDropInput.scss';
import { ContiguousText } from 'data/content/learning/contiguous';
import { Initiator } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentElements } from 'data/content/common/elements';
import { Badge } from '../common/Badge';
import { HTMLLayout } from 'data/content/assessment/dragdrop/htmlLayout/html_layout';
import { Maybe } from 'tsmonad';
export const isComplexScoring = (partModel: contentTypes.Part) => {
  const responses = partModel.responses.toArray();

  // scoring is complex (advanced mode) if score is not 0 or 1
  const isAdvancedScoringMode = responses.reduce(
    (acc, val, i) => {
      const score = +val.score;
      return acc || (score !== 0 && score !== 1);
    },
    false,
  );

  return isAdvancedScoringMode;
};

export const convertToSimpleScoring = (partModel: contentTypes.Part) => {
  const responses = partModel.responses.toArray();

  const updatedResponses = responses.reduce(
    (acc, r) => acc.set(r.guid, r.with({ score: +r.score > 0 ? '1' : '0' })),
    partModel.responses,
  );

  const updatedPartModel = partModel.with({
    responses: updatedResponses,
  });

  return updatedPartModel;
};

export interface DynaDropInputProps
  extends QuestionProps<contentTypes.QuestionItem> {
  activeContext: ActiveContext;
  selectedInitiator: string;
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
  onAddItemPart: (item, part, body) => void;
}

export interface DynaDropInputState extends QuestionState {

}

/**
 * DynaDropInput Question Editor
 */
export class DynaDropInput extends Question<DynaDropInputProps, DynaDropInputState> {
  placeholderText: ContentElement;

  constructor(props: DynaDropInputProps) {
    super(props);

    this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
    this.editInitiatorText = this.editInitiatorText.bind(this);

    this.placeholderText = ContiguousText.fromText('', guid());
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'dynadrop-input';
  }

  componentDidMount() {
    const {
      partModel, model, advancedScoringInitialized, onToggleAdvancedScoring,
    } = this.props;

    // initialize advanced scoring if its not already
    if (!advancedScoringInitialized) {
      onToggleAdvancedScoring(model.guid, isComplexScoring(partModel));
    }
  }

  onToggleAdvanced() {
    const {
      itemModel, partModel, model, onToggleAdvancedScoring, advancedScoring, onEdit,
    } = this.props;

    // if switching from advanced mode and scoring is complex, reset all scores
    // so they are valid in simple mode. Otherwise, we can leave the scores as-is
    if (advancedScoring && isComplexScoring(partModel)) {
      const updatedPartModel = convertToSimpleScoring(partModel);
      onEdit(itemModel, updatedPartModel, updatedPartModel);
    }

    onToggleAdvancedScoring(model.guid);
  }

  editInitiatorText(text: string, initiator: Initiator) {
    const { model, selectedInitiator, onBodyEdit } = this.props;

    const customElement = (model.body.content.find(c =>
      c.contentType === 'Custom') as contentTypes.Custom);

    customElement.layoutData
      .lift(ld => ld.initiators)
      .lift(initiators => initiators.find(i => i.inputVal === selectedInitiator))
      .lift((initiator) => {
        const updatedInitiator = initiator.with({
          text,
        });

        // update custom element in question body with the updated initiator
        const newCustomElement = customElement.withMutations(
            (custom: contentTypes.Custom) => custom.with({
              layoutData: custom.layoutData.caseOf({
                just: ld => Maybe.just<HTMLLayout>(ld.with({
                  initiators: ld.initiators.map(i =>
                    i.guid === updatedInitiator.guid ? updatedInitiator : i,
                  ).toList(),
                })),
                nothing: () => Maybe.nothing<HTMLLayout>(),
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

    // We want this component to display a ContiguousTextEditor in the
    // case where there is no content other than the drag and drop in the model
    const contentWithPlaceholder = (body as ContentElements).content.size === 1
      ? Immutable.OrderedMap<string, ContentElement>()
          .set(this.placeholderText.guid, this.placeholderText)
          .concat((body as ContentElements).content) as Immutable.OrderedMap<string, ContentElement>
      : (body as ContentElements).content;

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
          model={(body as ContentElements).with({ content: contentWithPlaceholder })}
          onEdit={onBodyEdit} />
      </div>
    );
  }

  renderItemParts(): JSX.Element[] {
    const { model, selectedInitiator, hideGradingCriteria,
      advancedScoring } = this.props;

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
      .lift(ld => ld.contentType === 'HTMLLayout' ? ld.initiators : undefined)
      .lift(initiators => initiators.find(i => i.inputVal === selectedInitiator))
      .caseOf({
        just: initiator => initiator,
        nothing: () => undefined,
      });

    if (!initiator) {
      return;
    }

    const renderSkillsLabel = (part: contentTypes.Part) => (
      <span>Skills <Badge color={part.skills.size > 0 ? '#2ecc71' : '#e74c3c'}>
          {part.skills.size}
        </Badge>
      </span>
    );

    return [(
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            initiator.text,
            renderSkillsLabel(part),
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
              advancedScoring={advancedScoring}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
              initiator={initiator}
              onEditInitiatorText={this.editInitiatorText}
              onToggleAdvanced={this.onToggleAdvanced}
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
