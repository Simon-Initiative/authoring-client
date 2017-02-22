
import * as persistence from '../../data/persistence';
import { PersistenceStrategy, onSaveCompletedCallback, 
  onFailureCallback, DocumentGenerator } from './PersistenceStrategy';

export interface DeferredPersistenceStrategy {
  successCallback: onSaveCompletedCallback;
  failureCallback: onFailureCallback;
  timer: any;
  timerStart: number;
  pending: persistence.Document;   // A document that is pending save 
  inFlight: persistence.Document;  // Document that is in flight
  writeLockedDocumentId: string;
}

/**
 * A persistence strategy 
 */
export class DeferredPersistenceStrategy implements PersistenceStrategy {

  constructor() {
    this.successCallback = null;
    this.failureCallback = null;

    this.timer = null;
    this.timerStart = 0;
    this.writeLockedDocumentId = null;
  }

  now() {
    return new Date().getTime();
  }

  save(doc: persistence.Document, documentGenerator: DocumentGenerator) {

    this.pending = documentGenerator(doc);

    if (!this.inFlight) {
      this.queueSave();
    }
  }

  queueSave() {
    let startTimer = () => setTimeout(() => {
          this.timer = null;
          this.persist();
        }, 2000);

    if (this.timer !== null) {
      
      clearTimeout(this.timer);
      this.timer = null;

      if (this.now() - this.timerStart > 5000) {
        this.persist();
      } else {
        this.timer = startTimer(); 
      }
    } else {
        this.timerStart = this.now();
        this.timer = startTimer();
    }
  }

  persist() {

    return new Promise((resolve, reject) => {
      this.inFlight = this.pending; 
      this.pending = null;

      persistence.persistDocument(this.inFlight._id, this.inFlight)
        .then(result => {

          if (this.successCallback !== null) {
            let savedDoc = persistence.copy(this.inFlight);
            savedDoc._rev = result.rev;
            this.successCallback(savedDoc);
          }

          this.inFlight = null;
          
          if (this.pending !== null) {
            this.pending._rev = result.rev;
            this.queueSave();
          }
          resolve(result);
        })
        .catch(err => {
          this.inFlight = null;
          if (this.failureCallback !== null) {
            this.failureCallback(err);
          }

          // TODO: revisit this logic.  We are at a state where we may
          // have encountered an error due to a conflict, so scheduling
          // another save without properly rebasing the revsition could be
          // futile. 
          if (this.pending !== null) {
            this.queueSave();
          }
          reject(err);
        });
      });
  }

  destroy() {
    let initiatedLockRelease = false;
    this.flushPendingChanges()
      .then(result => {
        initiatedLockRelease = true;
        this.releaseLock();
      })
      .catch(err => {
        console.log(err);
        if (!initiatedLockRelease) {
          this.releaseLock();
        }
      })
  }

  releaseLock() {
    // Release the write lock if it was acquired, but fetch
    // the document first to get the most up to date version
    if (this.writeLockedDocumentId !== null) {
      persistence.retrieveDocument(this.writeLockedDocumentId)
        .then(document => this.setWriteLock(document, ''));
    }
  }

  flushPendingChanges() {
    return new Promise((resolve, reject) => {
      // Flush pending changes:
      if (this.timer !== null) {
        clearTimeout(this.timer);
      }
      
      if (this.pending !== null) {
        return this.persist()
      } else {
        return Promise.resolve();
      }
    });    
  }

  setWriteLock(doc: persistence.Document, userId: string) : Promise<persistence.Document> {
    let currentMetadata = Object.assign({}, doc.metadata);
    let lockedBy = Object.assign({}, currentMetadata, { lockedBy: userId});
    let lockedDocument = Object.assign({}, doc, { metadata: lockedBy});
    return new Promise((resolve, reject) => {
      persistence.persistDocument(doc._id, lockedDocument)
        .then(success => {
          lockedDocument._rev = success.rev;
          resolve(lockedDocument);
        })
        .catch(err => reject(err));
    });
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

    let alreadyLocked = doc.metadata.lockedBy !== userId
      && doc.metadata.lockedBy !== ''; 

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
  }
}
