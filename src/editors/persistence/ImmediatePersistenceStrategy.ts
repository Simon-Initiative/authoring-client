
import * as persistence from '../../data/persistence';
import { PersistenceStrategy, onSaveCompletedCallback, 
  onFailureCallback, DocumentGenerator } from './PersistenceStrategy';

export interface ImmediatePersistenceStrategy {
  saveCallback: onSaveCompletedCallback;
  failureCallback: onFailureCallback
}

/**
 * A lock-free, optimistic persistence strategy.  
 */
export class ImmediatePersistenceStrategy implements PersistenceStrategy {

  initialize(doc: persistence.Document, userId: string) : Promise<boolean> {
    return Promise.resolve(true);
  }

  save(initialDoc: persistence.Document, documentGenerator: DocumentGenerator) {
    
  }
  
  destroy() {
    // No op
  }
  
  onSaveCompleted(callback: onSaveCompletedCallback) {
    this.saveCallback = callback;
  }

  onSaveFailed(callback: onFailureCallback) {
    this.failureCallback = callback; 
  }
}