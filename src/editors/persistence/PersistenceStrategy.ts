
import * as persistence from '../../data/persistence';

export type onSaveCompletedCallback = (result: persistence.PersistSuccess) => void;

export type onFailureCallback = (result: any) => void;

export type DocumentGenerator = (doc: persistence.Document) => persistence.Document;

export interface PersistenceStrategy {
  
  /**
   * Enables the persistence strategy, can asynchronously return false to indicate
   * that editing is not allowed.
   */
  initialize: (doc: persistence.Document, userId: string) => Promise<boolean>; 

  /**
   * Method called to request that the persistence strategy saves the document. 
   * This method takes as an argument a function that when executed produces the
   * Document that is to be saved. This function must be pure as the client code
   * can make no assumption about how many times the underlying persistence 
   * strategy may execute this method. 
   */
  save: (initialDoc: persistence.Document, documentGenerator: DocumentGenerator) => void;
  
  /**
   * Indicate to the persistence strategy that it is being shutdown and that it
   * should clean up any resources and flush any pending changes immediately.
   */
  destroy: () => void;
  
  /**
   * Callback to execute when an actual save is completed. 
   */
  onSaveCompleted: (callback: onSaveCompletedCallback) => void;  

  /**
   * Callback to execute when an attempted save fails.
   */
  onSaveFailed: (callback: onFailureCallback) => void;  

}