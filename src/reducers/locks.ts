import { Map, Set } from 'immutable';

import {
  RegisterLocksAction,
  UnregisterLocksAction,
  REGISTER_LOCKS,
  UNREGISTER_LOCKS,
} from 'actions/locks';

import { AcquiredLock } from 'types/locks';
import { OtherAction } from './utils';

export type LocksAction = RegisterLocksAction | UnregisterLocksAction | OtherAction;
export type LocksState = Map<string, AcquiredLock>;

const initialState: LocksState = Map<string, AcquiredLock>();

const key = (lock: AcquiredLock) => lock.courseId + '-' + lock.documentId;

export const locks = (
  state: LocksState = initialState,
  action: LocksAction,
) : LocksState => {
  switch (action.type) {
    case REGISTER_LOCKS:
      return state.merge(Map(action.locks.map(lock => [key(lock), lock])));
    case UNREGISTER_LOCKS:
      const toRemove = Set(action.locks.map(lock => key(lock)));
      return state.filter(lock => !toRemove.has(key(lock))).toMap();
    default:
      return state;
  }
};
