
import * as persistence from '../../../../data/persistence';
import { PersistenceStrategy, onSaveCompletedCallback, 
  onFailureCallback, DocumentGenerator } from './PersistenceStrategy';
import { AbstractPersistenceStrategy } from './AbstractPersistenceStrategy';

/**
 * A persistence strategy that applies changes immediately, and will auto
 * retry if a conflict is detected. 
 */
export class ImmediatePersistenceStrategy extends AbstractPersistenceStrategy {

  save(initialDoc: persistence.Document, documentGenerator: DocumentGenerator) {
    this.saveDocument(initialDoc, documentGenerator, 3, undefined, undefined)
      .then(doc => {
        if (this.successCallback !== null) {
          this.successCallback(doc);
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

        persistence.persistDocument(toSave)
          .then(result => {
            initialResolve !== undefined ? initialResolve(result) : resolve(result);
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
  
  doDestroy() {
    return Promise.resolve({});
  }
  
}