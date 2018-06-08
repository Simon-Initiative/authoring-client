import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Button } from '../common/controls';
import guid from 'utils/guid';
import {
    Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { ChoiceList, Choice, updateChoiceValuesAndRefs } from 'editors/content/common/Choice';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import { ContentElements, FLOW_ELEMENTS } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ImageHotspotEditor } from './imagehotspot/ImageHotspotEditor';

import { styles } from './ImageHotspot.styles';

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

export interface ImageHotspotProps
    extends QuestionProps<contentTypes.ImageHotspot> {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

export interface ImageHotspotState
    extends QuestionState {

}

/**
 * ImageHotspot Editor React Component
 */
@injectSheet(styles)
export class ImageHotspot
   extends Question<StyledComponentProps<ImageHotspotProps>, ImageHotspotState> {
  choiceMap: Immutable.Map<string, contentTypes.Choice>;

  constructor(props) {
    super(props);

    this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
    this.onToggleSimpleSelect = this.onToggleSimpleSelect.bind(this);
    this.onFeedbackEdit = this.onFeedbackEdit.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onImageHotspotEdit = this.onImageHotspotEdit.bind(this);

    this.choiceMap = Immutable.Map<string, contentTypes.Choice>();
  }

  /** Implement required abstract method to set className */
  getClassName() {
    const { classes, className } = this.props;
    return classNames(['ImageHotspot', classes.ImageHotspot, className]);
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

  onToggleSimpleSelect(response: contentTypes.Response, choice: contentTypes.Choice) {
    const { itemModel, partModel, onEdit } = this.props;

    let updatedPartModel = convertToSimpleScoring(partModel);

    updatedPartModel = updatedPartModel.with({
      responses: updatedPartModel.responses.set(
        response.guid, response.with({ score: response.score === '0' ? '1' : '0' }),
      ),
    });

    onEdit(itemModel, updatedPartModel, updatedPartModel);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback, src) {
    const { partModel, itemModel, onEdit } = this.props;

    const updated = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    const part = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) });
    onEdit(itemModel, part, src);
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const { partModel, itemModel, onEdit } = this.props;

    const updatedScore = response.with({ score });
    const updatedPartModel = partModel.with(
      { responses: partModel.responses.set(updatedScore.guid, updatedScore) },
    );

    onEdit(itemModel, updatedPartModel, updatedPartModel);
  }

  onImageHotspotEdit(imageHotspot: contentTypes.ImageHotspot) {
    const { onEdit, partModel } = this.props;

    onEdit(imageHotspot, partModel, imageHotspot);
  }

  /** Overrides parent method renderQuestionSection */
  renderQuestionSection() {
    const {
      editMode,
      services,
      context,
      body,
      itemModel,
      onBodyEdit,
    } = this.props;

    return (
      <div className="question-body" key="question">
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

          <ImageHotspotEditor
            editMode={editMode}
            onEdit={this.onImageHotspotEdit}
            context={context}
            model={itemModel} />
      </div>
    );
  }

  renderChoices() {
    const { context, services, editMode, partModel, itemModel, advancedScoring } = this.props;

    const responses = partModel.responses.toArray();
    const hotspots = itemModel.hotspots.toArray();

    // create choices wrappers for hotspots so we can just use
    // the Choice component for editing feedback
    const choices = hotspots.map((hotspot) => {
      if (!this.choiceMap.has(hotspot.value)) {
        // if a choice doesn't exist for a hotspot, create it on the fly and memoize
        const newChoice = new contentTypes.Choice().with({
          body: new ContentElements().with({ supportedElements: Immutable.List(FLOW_ELEMENTS) }),
          value: hotspot.value,
        });

        this.choiceMap = this.choiceMap.set(newChoice.value, newChoice);
      }

      return this.choiceMap.get(hotspot.value);
    });

    return choices.map((choice, i) => {
      const response = responses[i];
      return (
        <Choice
          activeContentGuid={this.props.activeContentGuid}
          hover={this.props.hover}
          onUpdateHover={this.props.onUpdateHover}
          onFocus={this.props.onFocus}
          key={choice.guid}
          index={i}
          hideChoiceBody
          choice={choice}
          allowFeedback
          allowScore={advancedScoring}
          simpleSelectProps={{
            selected: response.score !== '0',
            onToggleSimpleSelect: this.onToggleSimpleSelect,
          }}
          response={response}
          context={context}
          services={services}
          editMode={editMode}
          onEditChoice={() => {/* do nothing */}}
          onEditFeedback={this.onFeedbackEdit}
          onEditScore={this.onScoreEdit} />
      );
    });
  }

  renderDetails() {
    const { editMode, itemModel, advancedScoring } = this.props;

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Hotspots" />
          <TabSectionContent>
            <div className="instruction-label">
              Select the correct hotspots and provide feedback
            </div>
            <ChoiceList className="multiple-choice-choices">
              {this.renderChoices()}
            </ChoiceList>
          </TabSectionContent>
        </TabSection>
      </React.Fragment>
    );
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }
}
