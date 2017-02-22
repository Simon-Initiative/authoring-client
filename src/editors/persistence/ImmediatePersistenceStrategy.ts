
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

  initialize(doc: persistence.Document, userId: string,
    onSuccess: onSaveCompletedCallback, 
    onFailure: onFailureCallback) : Promise<boolean> {

    this.saveCallback = onSuccess;
    this.failureCallback = onFailure;

    return Promise.resolve(true);
  }

  save(initialDoc: persistence.Document, documentGenerator: DocumentGenerator) {
    this.saveDocument(initialDoc, documentGenerator, 3, undefined, undefined)
      .then(doc => {
        if (this.saveCallback !== null) {
          this.saveCallback(doc);
        }
      })
      .catch(err => {
        if (this.failureCallback !== null) {
          this.failureCallback(err);
        }
      });
  }

  /**
   * Attempts to save the document.  Will auto retry a maximum number of times
   * to seamlessly handle conflicts. 
   */
  saveDocument(initialDoc: persistence.Document, documentGenerator: DocumentGenerator,
    remainingRetries: number,
    initialResolve: any, initialReject: any)
    : Promise<persistence.Document> {

      return new Promise((resolve, reject) => {
        let toSave = documentGenerator(initialDoc);
        persistence.persistDocument(initialDoc._id, toSave)
          .then(result => {
            let copy = persistence.copy(toSave);
            copy._rev = result.rev;
            initialResolve !== undefined ? initialResolve(copy) : resolve(copy);
          })
          .catch(err => {
            if (remainingRetries === 0) {
              initialReject !== undefined ? initialReject(err) : reject(err);
            } else {
              persistence.retrieveDocument(initialDoc._id)
                .then(doc => {
                  this.saveDocument(doc, documentGenerator, --remainingRetries,
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
  
  destroy() {
    // No op
  }
  
}