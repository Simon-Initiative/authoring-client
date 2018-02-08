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
} from 'editors/content/common/InputList.tsx';
import { Button } from 'editors/content/common/Button';

import './Choice.scss';
import { ContentContainer } from 'editors/content/container/ContentContainer';

const HTML_CONTENT_EDITOR_STYLE = {
  minHeight: '20px',
  borderStyle: 'none',
  borderWith: 1,
  borderColor: '#AAAAAA',
};

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
    let newResponses = OrderedMap<string, contentTypes.Response>();
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

export interface ChoiceProps  {
  index: number;
  choice: contentTypes.Choice;
  response?: contentTypes.Response;
  allowFeedback?: boolean;
  allowScore?: boolean;
  allowReorder?: boolean;
  editMode: boolean;
  context: AppContext;
  services: AppServices;
  simpleSelectProps?: {
    onToggleSimpleSelect: (response: contentTypes.Response, choice: contentTypes.Choice) => void;
    selected?: boolean;
  };
  onReorderChoice?: (originalIndex: number, newIndex: number) => void;
  onEditChoice: (choice: contentTypes.Choice) => void;
  onEditFeedback?: (response: contentTypes.Response, feedback: contentTypes.Feedback) => void;
  onEditScore?: (response: contentTypes.Response, score: string) => void;
  onRemove: (choiceId: string) => void;
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
      choice, context, editMode, index, response, services, onReorderChoice, onEditChoice,
      onEditFeedback, onEditScore, onRemove, allowReorder, allowFeedback, allowScore,
      simpleSelectProps,
    } = this.props;

    let feedbackEditor;
    let scoreEditor;
    if (response && response.feedback.size > 0) {
      const feedback = response.feedback.first();

      feedbackEditor =
        <ContentContainer
          model={feedback.body}
          editMode={editMode}
          context={context}
          services={services}
          onEdit={body => onEditFeedback(
            response,
            feedback.with({ body: (body as ContentElements) }))} />;


      scoreEditor = (
        <div className="input-group">
          <input
            type="number"
            className="form-control"
            disabled={!editMode}
            value={response.score}
            onChange={({ target: { value } }) => onEditScore(response, value) } />
        </div>
      );
    }

    return (
      <InputListItem
        className="choice"
        id={choice.guid}
        label={convert.toAlphaNotation(index)}
        context={context}
        services={services}
        editMode={editMode}
        index={index}
        isDraggable={allowReorder}
        onDragDrop={onReorderChoice}
        dragType={DragTypes.Choice}
        body={choice.body}
        onEdit={body => onEditChoice(choice.with({ body }))}
        onRemove={id => onRemove(id)}
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
                    className={`fa ${simpleSelectProps.selected
                      ? 'fa-check-circle' : 'fa-check-circle-o'}`
                    } />
                  </Button>
                </ItemControl>
              )
              : (null)
            }
          </ItemControls>
        }
        options={
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
          </ItemOptions>
        } />
    );
  }
}
