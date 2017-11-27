import { Map } from 'immutable';
import {
  ReceiveTitlesAction,
  UpdateTitlesAction,
  RemoveTitlesAction,
  ResetTitlesAction,
  RECEIVE_TITLES,
  UPDATE_TITLES,
  REMOVE_TITLES,
  RESET_TITLES,
} from 'actions/course';
import * as models from 'data/models';
import { OtherAction } from './utils';

export type CourseActions = ReceiveTitlesAction | UpdateTitlesAction
  | ResetTitlesAction | OtherAction;
export type TitlesState = Map<string, string>;

const initialState: TitlesState = Map<string, string>();

export const titles = (
  state: TitlesState = initialState,
  action: CourseActions,
) : TitlesState => {
  switch (action.type) {
    case RECEIVE_TITLES:
    case UPDATE_TITLES:
      // convert received titles from list to map and merge with current state
      const titlesMap = action.titles.reduce(
        (acc, val) => {
          acc[val.id] = val.title;
          return acc;
        },
        {});
      return state.merge(titlesMap);
    case RESET_TITLES:
      return initialState;
    default:
      return state;
  }
};
