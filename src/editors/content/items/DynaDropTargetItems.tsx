import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
    AbstractItemPartEditor, AbstractItemPartEditorProps,
    AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import { Button } from '../common/controls';
import guid from 'utils/guid';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { ChoiceList, Choice,
  updateChoiceValuesAndRefs } from 'editors/content/common/Choice';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { TextInput } from 'editors/content/common/TextInput';
import { ContentElements } from 'data/content/common/elements';
import { Initiator } from 'data/content/assessment/dragdrop/initiator';
import {
  choiceAssessmentIdSort, responseAssessmentIdSort,
} from 'editors/content/learning/dynadragdrop/utils';

export interface DynaDropTargetItemsProps
  extends AbstractItemPartEditorProps<contentTypes.FillInTheBlank> {
  initiator: Initiator;
  advancedScoring: boolean;
  onEditInitiatorText: (text: string, initiator: Initiator) => void;
  onToggleAdvanced: () => void;
}

export interface DynaDropTargetItemsState extends AbstractItemPartEditorState {

}

/**
 * DynaDropTargetItems Editor
 */
export class
DynaDropTargetItems
  extends AbstractItemPartEditor<contentTypes.FillInTheBlank,
    DynaDropTargetItemsProps, DynaDropTargetItemsState> {

  constructor(props) {
    super(props);

    this.onFeedbackEdit = this.onFeedbackEdit.bind(this);
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onToggleSimpleSelect = this.onToggleSimpleSelect.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback, src) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const updated = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    const part = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) },
    );
    onEdit(itemModel, part, src);
  }

  onChoiceEdit(choice: contentTypes.Choice, src) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(
      itemModel.with(
      { choices: itemModel.choices.set(choice.guid, choice) }),
      partModel, src);
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    const updated = response.with({ score });
    const newPartModel = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) });
    onEdit(itemModel, newPartModel, updated);
  }

  onToggleSimpleSelect(response: contentTypes.Response, choice: contentTypes.Choice) {
    const { itemModel, partModel, onEdit } = this.props;

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(
        response.guid, response.with({ score: response.score === '0' ? '1' : '0' }),
      ),
    });

    onEdit(itemModel, updatedPartModel, updatedPartModel);
  }

  renderChoices() {
    const { context, services, editMode, partModel, itemModel, advancedScoring } = this.props;

    const responses = partModel.responses.toArray().sort(responseAssessmentIdSort);
    const choices = itemModel.choices.toArray().sort(choiceAssessmentIdSort);

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
          choice={choice}
          hideChoiceBody={true}
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
          onEditChoice={this.onChoiceEdit}
          onEditFeedback={this.onFeedbackEdit}
          onEditScore={this.onScoreEdit} />
      );
    });
  }

  render() {
    const {
      editMode,
      itemModel,
      initiator,
      advancedScoring,
      onEditInitiatorText,
      onToggleAdvanced,
    } = this.props;

    return (
      <TabSection className="targets">
      <TabSectionHeader title="Label">
        <TabOptionControl key="advanced" name="">
          <ToggleSwitch
            labelBefore="Advanced" checked={advancedScoring} onClick={onToggleAdvanced} />
        </TabOptionControl>
      </TabSectionHeader>
      <TabSectionContent>
      <input
        disabled={!editMode}
        style={{ fontSize: 16 }}
        onChange={({ target: { value } }) => onEditInitiatorText(value, initiator)}
        className="form-control form-control-sm"
        type="text"
        defaultValue={initiator.text} />
      </TabSectionContent>
        <TabSectionHeader title="Targets">
        </TabSectionHeader>
        <TabSectionContent>
          <ChoiceList>
            {this.renderChoices()}
          </ChoiceList>
        </TabSectionContent>
      </TabSection>
    );
  }
}
