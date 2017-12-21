import { AcquiredLock } from 'types/locks';

export type REGISTER_LOCKS = 'REGISTER_LOCKS';
export const REGISTER_LOCKS : REGISTER_LOCKS = 'REGISTER_LOCKS';

export type UNREGISTER_LOCKS = 'UNREGISTER_LOCKS';
export const UNREGISTER_LOCKS : UNREGISTER_LOCKS = 'UNREGISTER_LOCKS';

export type RegisterLocksAction = {
  type: REGISTER_LOCKS,
  locks: AcquiredLock[],
};

export function registerLocks(locks: AcquiredLock[]) : RegisterLocksAction {
  return {
    type: REGISTER_LOCKS,
    locks,
  };
}

export type UnregisterLocksAction = {
  type: UNREGISTER_LOCKS,
  locks: AcquiredLock[],
};

export function unregisterLocks(locks: AcquiredLock[]) : UnregisterLocksAction {
  return {
    type: UNREGISTER_LOCKS,
    locks,
  };
}

