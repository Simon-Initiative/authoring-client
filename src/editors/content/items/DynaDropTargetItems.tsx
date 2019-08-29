import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractItemPartEditor, AbstractItemPartEditorProps,
  AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'components/common/TabContainer';
import { ChoiceList, Choice } from 'editors/content/common/Choice';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { Initiator } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import {
  sortChoicesByLayout, sortResponsesByChoice,
} from 'editors/content/learning/dynadragdrop/utils';
import { HTMLLayout } from 'data/content/assessment/dragdrop/htmlLayout/html_layout';
import { Maybe } from 'tsmonad';

export interface DynaDropTargetItemsProps
  extends AbstractItemPartEditorProps<contentTypes.FillInTheBlank> {
  initiator: Initiator;
  advancedScoring: boolean;
  layout: HTMLLayout;
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

  onFeedbackEdit(response: contentTypes.Response, feedback: contentTypes.Feedback, src) {
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

    const updated = response.with({ score: Maybe.just(score) });
    const newPartModel = partModel.with(
      { responses: partModel.responses.set(updated.guid, updated) });
    onEdit(itemModel, newPartModel, updated);
  }

  onToggleSimpleSelect(response: contentTypes.Response, choice: contentTypes.Choice) {
    const { itemModel, partModel, onEdit } = this.props;

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(
        response.guid, response.with({
          score: response.score.caseOf({
            just: score => score === '0' ? Maybe.just('1') : Maybe.just('0'),
            nothing: () => Maybe.nothing(),
          }),
        }),
      ),
    });

    onEdit(itemModel, updatedPartModel, updatedPartModel);
  }

  renderChoices() {
    const { context, services, editMode, partModel, itemModel,
      layout, advancedScoring } = this.props;

    const choices = sortChoicesByLayout(itemModel.choices, layout);
    const responses = sortResponsesByChoice(partModel.responses, choices);

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
            selected: response.score.caseOf({
              just: score => score !== '0',
              nothing: () => true,
            }),
            onToggleSimpleSelect: this.onToggleSimpleSelect,
          }}
          response={response}
          context={context}
          services={services}
          editMode={editMode}
          onEditChoice={this.onChoiceEdit}
          onEditFeedback={this.onFeedbackEdit}
          branchingQuestions={this.props.branchingQuestions}
          onEditScore={this.onScoreEdit} />
      );
    });
  }

  render() {
    const {
      editMode,
      initiator,
      advancedScoring,
      onEditInitiatorText,
      onToggleAdvanced,
    } = this.props;

    return (
      <TabSection className="targets">
        <TabSectionHeader title="Label">
          <TabOptionControl name="advanced">
            <ToggleSwitch
              checked={advancedScoring}
              label="Advanced"
              onClick={onToggleAdvanced} />
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
          <div className="instruction-label">
            Select the correct targets and provide feedback
          </div>
          <ChoiceList>
            {this.renderChoices()}
          </ChoiceList>
        </TabSectionContent>
      </TabSection>
    );
  }
}
