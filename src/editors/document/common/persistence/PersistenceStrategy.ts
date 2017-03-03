
import * as persistence from '../../../../data/persistence';

import { ChangeRequest } from '../../../../data/models';

export type onSaveCompletedCallback = (lastSavedDocument: persistence.Document) => void;

export type onFailureCallback = (result: any) => void;

export interface PersistenceStrategy {
  
  /**
   * Enables the persistence strategy, can asynchronously return false to indicate
   * that editing is not allowed.
   */
  initialize: (doc: persistence.Document, 
    userId: string,
    onSuccess: onSaveCompletedCallback, 
    onFailure: onFailureCallback ) => Promise<boolean>; 

  /**
   * Method called to request that the persistence strategy saves the document. 
   * This method takes as an argument a change request. This is a function 
   * that when executed produces the content model  that is to be saved. 
   * This function must be pure as the client code
   * can make no assumption about how many times the underlying persistence 
   * strategy may execute this method. 
   */
  save: (initialDoc: persistence.Document, changeRequest: ChangeRequest) => void;
  
  /**
   * Indicate to the persistence strategy that it is being shutdown and that it
   * should clean up any resources and flush any pending changes immediately.
   */
  destroy: () => Promise<{}>;
  
}