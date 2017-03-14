
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';

import { PersistenceStrategy, onSaveCompletedCallback, 
  onFailureCallback } from './PersistenceStrategy';

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

  setWriteLock(doc: persistence.Document, requestTime: number, userId: string) : Promise<persistence.Document> {

    return this.setWriteLockHelper(doc, userId, requestTime, 3, undefined, undefined);
  }

  setWriteLockHelper(doc: persistence.Document, userId: string,
    requestTime: number, 
    remainingRetries: number, initialResolve, initialReject) : Promise<persistence.Document> {

    let lock : contentTypes.LockContent = (doc.model as any).lock;
    if (lock.lockedAt > requestTime) {
      // Do nothing, since another, async operation that was initiated after
      // this lock mutation has completed. 
      return Promise.resolve(doc);
    }

    return new Promise((resolve, reject) => {

        
        let updatedLock = lock.with({
          lockedBy: userId,
          lockedAt: (new Date()).getTime()
        });
        
        let lockedDocument = doc.with({ model: (doc.model as any).with({ lock: updatedLock})});
        
        persistence.persistDocument(lockedDocument)
          .then(result => {
            initialResolve !== undefined ? initialResolve(result) : resolve(result);
          })
          .catch(err => {
            if (remainingRetries === 0) {
              initialReject !== undefined ? initialReject(err) : reject(err);
            } else {
              persistence.retrieveDocument(doc._id)
                .then(doc => {
                  this.setWriteLockHelper(doc, userId, requestTime, --remainingRetries,
                    initialResolve === undefined ? resolve : initialResolve,
                    initialReject === undefined ? reject : initialReject);
                })
                .catch(err => {
                  initialReject !== undefined ? initialReject(err) : reject(err);
                })
            }
            
          });
      });
  }

  releaseLock(when: number) {
    // Release the write lock if it was acquired, but fetch
    // the document first to get the most up to date version

    if (this.writeLockedDocumentId !== null) {
      return persistence.retrieveDocument(this.writeLockedDocumentId)
        .then(document => this.setWriteLock(document, when, ''));
    } else {
      return Promise.resolve({});
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

    if (models.isLockable(doc.model)) {
      let lock : contentTypes.LockContent = (doc.model as any).lock;
      
      let alreadyLocked = lock.lockedBy !== userId
        && lock.lockedBy !== ''; 

      if (alreadyLocked) {
        return Promise.resolve(false);
      } else {
        // Attempt to acquire the lock
        return new Promise((resolve, reject) => {
          
          this.setWriteLock(doc, new Date().getTime(), userId)
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

  abstract save(initialDoc: persistence.Document, changeRequest: models.ChangeRequest) : void;
  
  /**
   * Method to that child classes must implement to allow an async
   * 
   */
  abstract doDestroy() : Promise<{}>;

  /**
   * Indicate to the persistence strategy that it is being shutdown and that it
   * should clean up any resources and flush any pending changes immediately.
   */
  destroy() : Promise<{}> {
    const now = new Date().getTime();
    return this.doDestroy()
      .then(r => this.releaseLock(now))

  };
}