
import { persistence } from '../../actions/persistence';
import { PersistenceStrategy, onSaveCompletedCallback, onFailureCallback } from './PersistenceStrategy';

export interface DeferredPersistenceStrategy {
  successCallback: onSaveCompletedCallback;
  failureCallback: onFailureCallback;
  timer: any;
  timerStart: number;
  pending: persistence.Document;   // A document that is pending save 
  inFlight: persistence.Document;  // Document that is in flight
  taskDescription: string;
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
  }

  now() {
    return new Date().getTime();
  }

  triggerChange(document: persistence.Document, taskDescription: string) {

    this.pending = document;
    this.taskDescription = taskDescription;

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

    this.inFlight = this.pending; 
    this.pending = null;

    persistence.persistDocument(this.pending._id, this.inFlight, this.taskDescription,
      (success) => {
        this.inFlight = null;
        if (this.successCallback !== null) {
          this.successCallback(success);
        }

        if (this.pending !== null) {
          this.pending._rev = success.rev;
          this.queueSave();
        }

      },
      (failure) => {
        this.inFlight = null;
        if (this.failureCallback !== null) {
          this.failureCallback(failure);
        }

        // TODO: revisit this logic.  We are at a state where we may
        // have encountered an error due to a conflict, so scheduling
        // another save without properly rebasing the revsition could be
        // futile. 
        if (this.pending !== null) {
          this.queueSave();
        }

      });
  }

  flushPendingChanges() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    if (this.pending !== undefined) {
      this.persist();
    }
  }

  onSaveCompleted(callback: onSaveCompletedCallback) {
    this.successCallback = callback;
  }

  onFailure(callback: onFailureCallback) {
    this.failureCallback = callback;
  }
}
