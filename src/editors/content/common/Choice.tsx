import * as React from 'react';
import { OrderedMap, Map } from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ContentElements } from 'data/content/common/elements';
import { DragTypes } from 'utils/drag';
import { convert } from 'utils/format';
import {
  InputList, InputListItem, ItemControls, ItemControl, ItemOptions, ItemOption, ItemOptionFlex,
} from 'editors/content/common/InputList';
import { Button } from 'editors/content/common/Button';

import './Choice.scss';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { classNames } from 'styles/jss';
import { Maybe } from 'tsmonad';
import { ConditionalBranchSelect } from './BranchSelect';

export const ChoiceList = InputList;

export const updateChoiceValuesAndRefs =
  (itemModel, partModel: contentTypes.Part) => {
    const choices = itemModel.choices.toArray();

    // update choices and their values and build remapping maps
    let newChoices = OrderedMap<string, contentTypes.Choice>();
    let updatedValuesMapping = Map<string, string>();

    choices.forEach((choice, index) => {
      updatedValuesMapping = updatedValuesMapping.set(choice.value, convert.toAlphaNotation(index));
      const value = updatedValuesMapping.get(choice.value);
      newChoices = newChoices.set(choice.guid, choice.with({ value }));
    });

    // update responses to new choice values
    let newResponses = OrderedMap<string, contentTypes.Response>(partModel.responses);
    partModel.responses.forEach((response) => {

      // filter out autogenerated responses
      if (response.name.match(/^AUTOGEN/)) {
        return;
      }

      // parse response matches from comma-seperated string
      let matches = response.match.split(',');
      // remove choices that no longer exist and update all matche references to thier new value
      matches = matches
        .map(m => updatedValuesMapping.get(m))
        .filter(m => m);

      // save new remapped matches as comma-seperated string
      newResponses = newResponses.set(
        response.guid,
        response.with({ match: matches.join(',') }),
      );
    });

    return {
      itemModel: itemModel.with({ choices: newChoices }),
      partModel: partModel.with({ responses: newResponses }),
    };
  };

export interface ChoiceProps {
  className?: string;
  index: number;
  choice: contentTypes.Choice;
  response?: contentTypes.Response;
  allowFeedback?: boolean;
  allowScore?: boolean;
  allowReorder?: boolean;
  wasLastCorrectChoice?: boolean; // true if this was the last correct choice and was just unchecked
  editMode: boolean;
  hideChoiceBody?: boolean;
  context: AppContext;
  services: AppServices;
  simpleSelectProps?: {
    onToggleSimpleSelect: (response: contentTypes.Response, choice: contentTypes.Choice) => void;
    selected?: boolean;
  };
  onReorderChoice?: (originalIndex: number, newIndex: number) => void;
  onFocus: (child, parent, textSelection) => void;
  onEditChoice: (choice: contentTypes.Choice, src) => void;
  onEditFeedback?: (response: contentTypes.Response, feedback: contentTypes.Feedback, src) => void;
  onEditScore?: (response: contentTypes.Response, score: string) => void;
  onRemove?: (choiceId: string) => void;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
  branchingQuestions: Maybe<number[]>;
}

export interface ChoiceState {

}

/**
 * React component Choice
 */
export class Choice extends React.PureComponent<ChoiceProps, ChoiceState> {

  constructor(props) {
    super(props);

  }

  render() {
    const {
      className, choice, context, editMode, index, response, services, onReorderChoice,
      onEditChoice, onEditFeedback, onEditScore, onRemove, allowReorder, allowFeedback, allowScore,
      simpleSelectProps, hideChoiceBody, wasLastCorrectChoice, branchingQuestions,
    } = this.props;

    let feedbackEditor;
    let scoreEditor;

    if (response && response.feedback.size > 0) {
      const feedback = response.feedback.first();

      feedbackEditor =
        <div>
          <ConditionalBranchSelect
            editMode={editMode}
            branch={feedback.lang}
            onChange={lang => onEditFeedback(response, feedback.with({ lang }), null)}
            questions={branchingQuestions}
          />
          <ContentContainer
            activeContentGuid={this.props.activeContentGuid}
            hover={this.props.hover}
            onUpdateHover={this.props.onUpdateHover}
            onFocus={this.props.onFocus}
            model={feedback.body}
            editMode={editMode}
            context={context}
            services={services}
            onEdit={(body, src) => onEditFeedback(
              response,
              feedback.with({ body: (body as ContentElements) }),
              src)} />

        </div>;

      scoreEditor = (
        <div className="input-group">
          <input
            type="number"
            className="form-control"
            disabled={!editMode}
            value={response.score.valueOr('')}
            onChange={({ target: { value } }) => onEditScore(response, value)} />
        </div>
      );
    }

    return (
      <InputListItem
        className={classNames(['choice', className])}
        id={choice.guid}
        activeContentGuid={this.props.activeContentGuid}
        hover={this.props.hover}
        onUpdateHover={this.props.onUpdateHover}
        onFocus={this.props.onFocus}
        label={convert.toAlphaNotation(index)}
        context={context}
        services={services}
        editMode={editMode}
        index={index}
        isDraggable={allowReorder}
        onDragDrop={onReorderChoice}
        dragType={DragTypes.Choice}
        body={choice.body}
        hideBody={hideChoiceBody}
        onEdit={(body, src) => onEditChoice(choice.with({ body }), src)}
        onRemove={onRemove || undefined}
        controls={
          <ItemControls>
            {simpleSelectProps
              ? (
                <ItemControl
                  className={`simple-select ${simpleSelectProps.selected ? 'selected' : ''}`}>
                  <Button type="link" editMode={editMode}
                    onClick={() =>
                      response && simpleSelectProps.onToggleSimpleSelect(response, choice)} >
                    <i
                      className={simpleSelectProps.selected
                        ? 'fas fa-check-circle' : 'far fa-check-circle'} />
                  </Button>
                </ItemControl>
              )
              : (null)
            }
          </ItemControls>
        }
        options={[
          <ItemOptions>
            {allowFeedback
              ? (
                <ItemOption className="feedback" label="Feedback" flex>
                  {feedbackEditor}
                </ItemOption>
              )
              : (<ItemOptionFlex />)
            }
            {allowScore
              ? (
                <ItemOption className="score" label="Score">
                  {scoreEditor}
                </ItemOption>
              )
              : (null)
            }
          </ItemOptions>,
          <ItemOptions key="feedback-message">
            {wasLastCorrectChoice ? (
              <div className="message alert alert-warning">
                <i className="fa fa-exclamation-circle" />
                {' Feedback requires at least one correct choice. Please select a correct choice'}
              </div>
            )
              : null}
          </ItemOptions>,
        ]} />
    );
  }
}
