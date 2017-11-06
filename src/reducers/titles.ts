import { Map } from 'immutable';
import {
  ReceiveTitlesAction,
  RECEIVE_TITLES,
} from 'app/actions/course';
import * as models from 'app/data/models';
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
      const titlesMap = action.titles.reduce((val, acc) => acc[val.id] = val.title && acc);
      return state.merge(titlesMap);
    default:
      return state;
  }
};
