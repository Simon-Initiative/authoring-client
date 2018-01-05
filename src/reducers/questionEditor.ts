import { Map } from 'immutable';
import {
  ToggleAdvancedScoring,
  TOGGLE_ADV_SCORING,
} from 'actions/questionEditor';
import { OtherAction } from './utils';

export type ActionTypes = ToggleAdvancedScoring | OtherAction;

type Scoring = Map<string, boolean>;
export type QuestionEditorState = Map<string, Scoring>;

const initialState: QuestionEditorState = Map<string, any>({
  scoring: Map<string, boolean>(),
});

export const questionEditor = (
  state: QuestionEditorState = initialState,
  action: ActionTypes,
): QuestionEditorState => {
  switch (action.type) {
    case TOGGLE_ADV_SCORING:
      if (action.value !== undefined) {
        return state.setIn(['scoring', action.id], action.value);
      }

      return state.setIn(['scoring', action.id], !state.getIn(['scoring', action.id]));
    default:
      return state;
  }
};
