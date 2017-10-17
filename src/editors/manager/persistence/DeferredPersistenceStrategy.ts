
import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';

import { PersistenceStrategy, onSaveCompletedCallback, 
  onFailureCallback } from './PersistenceStrategy';
import { AbstractPersistenceStrategy } from './AbstractPersistenceStrategy';

export interface DeferredPersistenceStrategy {
  timer: any;
  timerStart: number;
  quietPeriodInMs: number;
  maxDeferredTimeInMs: number;
  pending: persistence.Document;   // A document that is pending save 
  inFlight: persistence.Document;  // Document that is in flight
  flushResolve: any;               // Function to call to resolve inflight requests after destroy
}

/**
 * A persistence strategy that waits until user edits have ceased
 * for a specific amount of time but will auto save when a maximum
 * wait period has exceeded. 
 */
export class DeferredPersistenceStrategy extends AbstractPersistenceStrategy {

  constructor(quietPeriodInMs : number = 2000, maxDeferredTimeInMs = 5000) {
    super();
    this.quietPeriodInMs = quietPeriodInMs;
    this.maxDeferredTimeInMs = maxDeferredTimeInMs;
    this.timer = null;
    this.timerStart = 0;
    this.flushResolve = null;
    this.inFlight = null;
    this.pending = null;
  }

  now() {
    return new Date().getTime();
  }

  save(doc: persistence.Document) {
    
    this.pending = doc;
    
    if (this.inFlight === null) {
      this.queueSave();
    }
  }

  queueSave() {
    const startTimer = 
      () => setTimeout(
        () => {
          this.timer = null;
          this.persist();
        }, 
        this.quietPeriodInMs);

    if (this.timer !== null) {
      
      clearTimeout(this.timer);
      this.timer = null;

      if (this.now() - this.timerStart > this.maxDeferredTimeInMs) {
        this.persist();
      } else {
        this.timer = startTimer(); 
      }
    } else {
      this.timerStart = this.now();
      this.timer = startTimer();
    }
  }

  persist() : Promise<{}> {

    return new Promise((resolve, reject) => {
      this.inFlight = this.pending; 
      this.pending = null;

      persistence.persistDocument(this.inFlight)
        .then((result) => {

          if (this.flushResolve !== null) {
            this.flushResolve();
            return;
          }

          if (this.successCallback !== null) {
            this.successCallback(result);
          }

          this.inFlight = null;
          
          if (this.pending !== null) {
            this.pending = this.pending.with({ _rev: result._rev });
            this.queueSave();
          }
          resolve(result);
        })
        .catch((err) => {
          console.log('Save err');
          console.log(err);

          this.inFlight = null;
          if (this.failureCallback !== null) {
            this.failureCallback(err);
          }

          // TODO: revisit this logic.  We are at a state where we may
          // have encountered an error due to a conflict, so scheduling
          // another save without properly rebasing the revsion could be
          // futile. 
          if (this.pending !== null) {
            this.queueSave();
          }
          reject(err);
        });
    });
  }

  doDestroy() {
    return this.flushPendingChanges();
  }


  flushPendingChanges() : Promise<{}> {

    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    
    // Handle the case where we have a pending change, but
    // there isn't anything in flight. We simply persist 
    // the pending change. 
    if (this.inFlight === null && this.pending !== null) {
      return this.persist();

    } else if (this.inFlight !== null) {
      // Handle the case where we have a persistence request
      // in flight.  In this case we have to wait for that 
      // in flight request to complete. 
   
      return new Promise((resolve, reject) => {
        // Flush pending changes:
        this.flushResolve = resolve;
      });    
      
    // Neither in flight or pending save, so there is nothing
    // to do. 
    } else {
      return Promise.resolve({});
    }
    
  }

}
