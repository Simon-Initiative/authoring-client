import { Map } from 'immutable';
import {
  DiscoverAction,
  DISCOVER,
  ClearDiscoverAction,
  CLEAR_DISCOVER,
} from 'actions/discoverable';
import { OtherAction } from './utils';
import { DiscoverableId } from 'types/discoverable';

export type ActionTypes = DiscoverAction | ClearDiscoverAction | OtherAction;
export type DiscoverableState = Map<DiscoverableId, boolean>;

const initialState = Map<DiscoverableId, boolean>();

export const discoverable = (
  state: DiscoverableState = initialState,
  action: ActionTypes,
): DiscoverableState => {
  switch (action.type) {
    case DISCOVER:
      return state.set(action.id, true);
    case CLEAR_DISCOVER:
      return state.clear();
    default:
      return state;
  }
};
