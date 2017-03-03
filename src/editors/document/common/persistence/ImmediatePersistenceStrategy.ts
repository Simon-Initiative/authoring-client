
import * as persistence from '../../../../data/persistence';
import * as models from '../../../../data/models';

import { PersistenceStrategy, onSaveCompletedCallback, 
  onFailureCallback } from './PersistenceStrategy';
import { AbstractPersistenceStrategy } from './AbstractPersistenceStrategy';

/**
 * A persistence strategy that applies changes immediately, and will auto
 * retry if a conflict is detected. 
 */
export class ImmediatePersistenceStrategy extends AbstractPersistenceStrategy {

  save(initialDoc: persistence.Document, changeRequest: models.ChangeRequest) {
    this.saveDocument(initialDoc, changeRequest, 3, undefined, undefined)
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
  saveDocument(initialDoc: persistence.Document, changeRequest: models.ChangeRequest,
    remainingRetries: number,
    initialResolve: any, initialReject: any)
    : Promise<persistence.Document> {

      return new Promise((resolve, reject) => {

        let toSave = initialDoc.with({ model: changeRequest(initialDoc.model)});

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
                  this.saveDocument(doc, changeRequest, --remainingRetries,
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