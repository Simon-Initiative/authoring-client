import { Map } from 'immutable';
import {
  ReceiveTitlesAction,
  RECEIVE_TITLES,
} from 'actions/course';
import * as models from 'data/models';
import { OtherAction } from './utils';

type CourseActions = ReceiveTitlesAction | OtherAction;
type TitlesState = Map<string, string>;

const initialState: TitlesState = Map<string, string>();

export const titles = (
  state: TitlesState = initialState,
  action: CourseActions,
) : TitlesState => {
  switch (action.type) {
    case RECEIVE_TITLES:
      // convert received titles from list to map and merge with current state
      const titlesMap = action.titles.reduce(
        (acc, val) => {
          acc[val.id] = val.title;
          return acc;
        },
        {});
      return state.merge(titlesMap);
    default:
      return state;
  }
};
