
import * as persistence from '../../data/persistence';

export type onSaveCompletedCallback = (result: persistence.PersistSuccess) => void;

export type onFailureCallback = (result: any) => void;


export interface PersistenceStrategy {
  
  /**
   * Method called to trigger persistence to the database. The document supplied
   * will be persisted and the taskDescription will stored with the outstanding
   * request. 
   */
  triggerChange: (document: persistence.Document, taskDescription: string) => void;
  
  /**
   * Indicate to the persistence strategy that all - if any - deferred or batched
   *  changes should be flushed and immedately be persisted. 
   */
  flushPendingChanges: () => void;
  
  /**
   * Callback to execute when an actual save is completed. 
   */
  onSaveCompleted: (callback: onSaveCompletedCallback) => void;  

  /**
   * Callback to execute when an attempted save fails.
   */
  onFailure: (callback: onFailureCallback) => void;  
  
}