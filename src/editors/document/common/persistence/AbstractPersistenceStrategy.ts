
import * as content from '../../data/content';
import * as persistence from '../../data/persistence';

import { PersistenceStrategy, onSaveCompletedCallback, 
  onFailureCallback, DocumentGenerator} from './PersistenceStrategy';


export interface AbstractPersistenceStrategy {
  successCallback: onSaveCompletedCallback;
  failureCallback: onFailureCallback;
  writeLockedDocumentId: string;
  destroyed: boolean;
}

export abstract class AbstractPersistenceStrategy implements PersistenceStrategy {

  constructor() {
    this.successCallback = null;
    this.failureCallback = null;
    this.writeLockedDocumentId = null;
    this.destroyed = false;
  }

  setWriteLock(doc: persistence.Document, userId: string) : Promise<persistence.Document> {
    
    let lockedDocument = persistence.copy(doc);
    (lockedDocument as content.Lockable).lockedBy = userId;
    (lockedDocument as content.Lockable).lockedAt = (new Date()).getTime();
    
    return new Promise((resolve, reject) => {
      persistence.persistDocument(lockedDocument)
        .then(success => {
          resolve(success);
        })
        .catch(err => {
          reject(err)
        });
    });
  }

  releaseLock() {
    // Release the write lock if it was acquired, but fetch
    // the document first to get the most up to date version
    if (this.writeLockedDocumentId !== null) {
      persistence.retrieveDocument(this.writeLockedDocumentId)
        .then(document => this.setWriteLock(document, ''));
    }
  }

  /**
   * This strategy requires the user to acquire the write lock before
   * editing.
   */
  initialize(doc: persistence.Document, userId: string,
    onSuccess: onSaveCompletedCallback, 
    onFailure: onFailureCallback) : Promise<boolean> {

    this.successCallback = onSuccess;
    this.failureCallback = onFailure;

    if (content.isLockable(doc)) {
      let lockable : content.Lockable = (doc as content.Lockable);
      
      let alreadyLocked = lockable.lockedBy !== userId
        && lockable.lockedBy !== ''; 

      if (alreadyLocked) {
        return Promise.resolve(false);
      } else {
        // Attempt to acquire the lock
        return new Promise((resolve, reject) => {
          this.setWriteLock(doc, userId)
            .then(lockedDocument => {
              this.writeLockedDocumentId = lockedDocument._id;
              onSuccess(lockedDocument);
              resolve(true)
            })
            .catch(err => {
              console.log(err);
              reject(err)
            });
        });
      }
    } else {
      return Promise.resolve(true);
    }
  }

  abstract save(initialDoc: persistence.Document, documentGenerator: DocumentGenerator) : void;
  
  /**
   * Method to that child classes must implement to allow an async
   * 
   */
  abstract doDestroy() : Promise<{}>;

  /**
   * Indicate to the persistence strategy that it is being shutdown and that it
   * should clean up any resources and flush any pending changes immediately.
   */
  destroy() {
    this.doDestroy()
      .then(r => this.releaseLock());
  };
}