import { Map } from 'immutable';
import {
  DiscoverAction,
  DISCOVER,
} from 'actions/discoverable';
import { OtherAction } from './utils';
import { DiscoverableId } from 'types/discoverable';
import createGuid from 'utils/guid';

export type ActionTypes = DiscoverAction | OtherAction;
export type DiscoverableState = Map<DiscoverableId, string>;

const initialState = Map<DiscoverableId, string>();

export const discoverable = (
  state: DiscoverableState = initialState,
  action: ActionTypes,
): DiscoverableState => {
  switch (action.type) {
    case DISCOVER:
      return state.set(action.id, createGuid());
    default:
      return state;
  }
};
