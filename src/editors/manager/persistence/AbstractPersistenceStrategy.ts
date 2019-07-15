import * as persistence from '../../../data/persistence';
import { LockDetails } from '../../../utils/lock';
import { CourseGuid, DocumentId, CourseIdVers } from 'data/types';

import {
  onFailureCallback, onSaveCompletedCallback,
  onStateChangeCallback, PersistenceStrategy,
} from './PersistenceStrategy';

export interface AbstractPersistenceStrategy {
  successCallback: onSaveCompletedCallback;
  failureCallback: onFailureCallback;
  stateChangeCallback: onStateChangeCallback;
  writeLockedDocumentId: DocumentId;
  courseId: string | CourseGuid | CourseIdVers;
  destroyed: boolean;
  lockDetails: LockDetails;
}

export abstract class AbstractPersistenceStrategy implements PersistenceStrategy {

  constructor() {
    this.successCallback = null;
    this.failureCallback = null;
    this.stateChangeCallback = null;
    this.writeLockedDocumentId = null;
    this.courseId = null;
    this.destroyed = false;
    this.lockDetails = null;
  }

  getLockDetails(): LockDetails {
    return this.lockDetails;
  }

  releaseLock(when: number) {

    // Release the write lock if it was acquired, but fetch
    // the document first to get the most up to date version

    if (this.writeLockedDocumentId !== null) {
      const courseId = typeof this.courseId === 'string'
        ? CourseGuid.of(this.courseId) : this.courseId;
      return persistence.releaseLock(courseId, this.writeLockedDocumentId);
    }
    return Promise.resolve({});
  }


  /**
   * This strategy requires the user to acquire the write lock before
   * editing.
   */
  initialize(
    doc: persistence.Document, userName: string,
    onSuccess: onSaveCompletedCallback,
    onFailure: onFailureCallback,
    onStateChange: onStateChangeCallback,
  ): Promise<boolean> {

    this.successCallback = onSuccess;
    this.failureCallback = onFailure;
    this.stateChangeCallback = onStateChange;

    return new Promise((resolve, reject) => {
      persistence.acquireLock(
        typeof doc._courseId === 'string'
          ? CourseGuid.of(doc._courseId)
          : doc._courseId,
        doc._id)
        .then((result) => {
          if ((result as any).lockedBy === userName) {
            this.lockDetails = (result as any);
            this.writeLockedDocumentId = doc._id;
            this.courseId = doc._courseId;

            resolve(true);

          } else {
            this.lockDetails = (result as any);
            resolve(false);
          }
        });
    });

  }

  abstract save(doc: persistence.Document): void;

  /**
   * Method to that child classes must implement to allow an async
   *
   */
  abstract doDestroy(): Promise<{}>;

  /**
   * Indicate to the persistence strategy that it is being shutdown and that it
   * should clean up any resources and flush any pending changes immediately.
   */
  destroy(): Promise<{}> {
    const now = new Date().getTime();
    return this.doDestroy()
      .then(r => this.releaseLock(now));

  }
}
