import * as persistence from 'data/persistence';
import { AbstractPersistenceStrategy } from
  'editors/manager/persistence/AbstractPersistenceStrategy';
import { CourseGuid } from 'data/types';

/**
 * A persistence strategy that applies changes immediately, and will auto
 * retry if a conflict is detected.
 */
export class ImmediatePersistenceStrategy extends AbstractPersistenceStrategy {

  save(doc: persistence.Document) {

    if (this.stateChangeCallback !== null) {
      this.stateChangeCallback({ isInFlight: true, isPending: false });
    }

    this.saveDocument(doc, 3, undefined, undefined)
      .then((doc) => {
        if (this.successCallback !== null) {
          this.successCallback(doc);
        }
        if (this.stateChangeCallback !== null) {
          this.stateChangeCallback({ isInFlight: false, isPending: false });
        }
      })
      .catch((err) => {
        if (this.failureCallback !== null) {
          this.failureCallback(err);
        }
        if (this.stateChangeCallback !== null) {
          this.stateChangeCallback({ isInFlight: false, isPending: false });
        }
      });
  }

  /**
   * Attempts to save the document.  Will auto retry a maximum number of times
   * to seamlessly handle conflicts.
   */
  saveDocument(initialDoc: persistence.Document,
    remainingRetries: number,
    initialResolve: any, initialReject: any)
    : Promise<persistence.Document> {

    return new Promise((resolve, reject) => {

      const toSave = initialDoc;

      persistence.persistDocument(toSave)
        .then((result) => {
          initialResolve !== undefined ? initialResolve(result) : resolve(result);
        })
        .catch((err) => {
          if (remainingRetries === 0) {
            initialReject !== undefined ? initialReject(err) : reject(err);
          } else {
            persistence.retrieveDocument(
              typeof initialDoc._courseId === 'string'
                ? CourseGuid.of(initialDoc._courseId)
                : initialDoc._courseId,
                initialDoc._id)
              .then((doc) => {
                const updated = toSave.with({ _rev: doc._rev });
                this.saveDocument(updated, (remainingRetries - 1),
                  initialResolve === undefined ? resolve : initialResolve,
                  initialReject === undefined ? reject : initialReject);
              })
              .catch((err) => {
                initialReject !== undefined ? initialReject(err) : reject(err);
              });
          }

        });
    });
  }

  doDestroy() {
    return Promise.resolve({});
  }

}
