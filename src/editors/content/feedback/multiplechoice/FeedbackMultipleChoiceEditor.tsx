import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Button } from 'editors/content/common/controls';
import guid from 'utils/guid';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { ChoiceList, Choice } from 'editors/content/common/Choice';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { FeedbackMultipleChoice } from 'data/content/feedback/feedback_multiple_choice';

import './FeedbackMultipleChoice.scss';
import { FeedbackPrompt } from 'data/content/feedback/feedback_prompt';
import { ContentElement } from 'data/content/common/interfaces';
import { FeedbackChoiceEditor } from 'editors/content/feedback/multiplechoice/FeedbackChoiceEditor';

export interface Props {
  editMode: boolean;
  model: FeedbackMultipleChoice;
  onEdit;
  canRemove;
}

export interface State {

}

/**
 * The content editor for Multiple Choice Question
 */
export class FeedbackMultipleChoiceEditor extends React.PureComponent<Props, State> {

  // onPromptEdit = (prompt: FeedbackPrompt, src: ContentElement) => {
  //   const { model, onEdit } = this.props;

  //   onEdit(model, src);
  // }

  // onToggleRequired = () => {
  //   const { model, onEdit } = this.props;

  //   onEdit(model.with({
  //     required: !model.required,
  //   }));
  // }

  // onAddChoice = () => {
  //   const { model, onEdit } = this.props;

  //   onEdit(model, this);
  // }

  // onChoiceEdit = (choice: contentTypes.Choice, src: ContentElement) => {
  //   const { model, onEdit } = this.props;

  //   const updated = model.with({
  //     choices: model.choices.set(choice.guid, choice),
  //   });
  //   onEdit(
  //     updated,
  //     model,
  //     src);
  // }

  // onRemoveChoice = (choiceId: string, response: contentTypes.Response) => {
  //   // need at least one choice
  //   if (this.props.model.choices.size <= 1) {
  //     return;
  //   }

  //   const { model, onEdit } = this.props;

  //   const updatedItemModel = model.with(
  //     { choices: model.choices.delete(choiceId) });

  //   let updatePartModel = model;
  //   if (response) {
  //     updatePartModel = model.with(
  //       { responses: model.responses.delete(response.guid) });
  //   }

  //   onEdit(updatedItemModel, updatePartModel, updatedItemModel);
  // }

  // onReorderChoices = (originalIndex: number, newIndex: number) => {
  //   const { onEdit, model } = this.props;

  //   // convert OrderedMap to shallow javascript array
  //   const choices = model.choices.toArray();

  //   // remove selected choice from array and insert it into new position
  //   const choice = choices.splice(originalIndex, 1)[0];
  //   choices.splice(newIndex, 0, choice);

  //   // update item model
  //   const updatedItemModel = model.with({
  //     // set choices to a new OrderedMap with updated choice ordering
  //     choices: choices.reduce(
  //       (acc, c) => {
  //         return acc.set(c.guid, c);
  //       },
  //       Immutable.OrderedMap<string, contentTypes.Choice>(),
  //     ),
  //   });

  //   onEdit(
  //     updatedItemModel,
  //     model,
  //     updatedItemModel,
  //   );
  // }

  // renderChoices() {
  //   const { context, editMode, model } = this.props;

  //   const choices = model.choices.toArray();

  //   return choices.map((choice, i) => {
  //     return (
  //       <FeedbackChoiceEditor
  //         activeContentGuid={this.props.activeContentGuid}
  //         hover={this.props.hover}
  //         onUpdateHover={this.props.onUpdateHover}
  //         onFocus={this.props.onFocus}
  //         key={choice.guid}
  //         index={i}
  //         choice={choice}
  //         allowFeedback
  //         allowScore={advancedScoring}
  //         simpleSelectProps={{
  //           selected: response.score !== '0',
  //           onToggleSimpleSelect: this.onToggleSimpleSelect,
  //         }}
  //         response={response}
  //         allowReorder={!model.shuffle}
  //         context={context}
  //         services={services}
  //         editMode={editMode}
  //         onReorderChoice={this.onReorderChoices}
  //         onEditChoice={this.onChoiceEdit}
  //         onEditFeedback={this.onFeedbackEdit}
  //         onEditScore={this.onScoreEdit}
  //         onRemove={this.props.model.choices.size > 1 ?
  //           choiceId => this.onRemoveChoice(choiceId, response) :
  //           undefined
  //         }
  //         branchingQuestions={this.props.branchingQuestions}
  //       />
  //     );
  //   });
  // }

  renderDetails() {
    const { editMode, model } = this.props;

    // return (
    //   <React.Fragment>
    //     <TabSection key="choices" className="choices">
    //       <TabSectionHeader title="Choices">
    //         <TabOptionControl name="add-choice">
    //           <Button
    //             editMode={editMode}
    //             type="link"
    //             onClick={this.onAddChoice}>
    //             Add Choice
    //           </Button>
    //         </TabOptionControl>
    //         <TabOptionControl name="shuffle">
    //           <ToggleSwitch
    //             editMode={editMode}
    //             checked={model.required}
    //             label="Response Required"
    //             onClick={this.onToggleRequired} />
    //         </TabOptionControl>
    //       </TabSectionHeader>
    //       <TabSectionContent>
    //         <div className="instruction-label">
    // Select the correct choice and provide feedback</div>
    //         <ChoiceList className="multiple-choice-choices">
    //           {this.renderChoices()}
    //         </ChoiceList>
    //       </TabSectionContent>
    //     </TabSection>
    //   </React.Fragment>
    // );
  }
}
