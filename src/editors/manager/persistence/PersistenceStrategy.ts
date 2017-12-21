
import * as persistence from '../../../data/persistence';
import { LockDetails } from '../../../utils/lock';
import { RegisterLocks, UnregisterLocks } from 'types/locks';
import { ChangeRequest } from '../../../data/models';
import { RegisteredEditor } from 'editors/manager/registry';

export type onSaveCompletedCallback = (lastSavedDocument: persistence.Document) => void;

export type onFailureCallback = (result: any) => void;



export interface PersistenceStrategy {

  /**
   * Enables the persistence strategy, can asynchronously return false to indicate
   * that editing is not allowed.
   */
  initialize: (doc: persistence.Document,
               userName: string,
               onSuccess: onSaveCompletedCallback,
               onFailure: onFailureCallback,
               registerLocks: RegisterLocks,
               unregisterLocks: UnregisterLocks,
              ) => Promise<boolean>;

  /**
   * Method called to request that the persistence strategy saves the document.
   */
  save: (doc: persistence.Document) => void;

  /**
   * Indicate to the persistence strategy that it is being shutdown and that it
   * should clean up any resources and flush any pending changes immediately.
   */
  destroy: () => Promise<{}>;

  getLockDetails: () => LockDetails;

}
