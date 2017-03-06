import * as types from '../../data/types';

import {modalActions} from '../../actions/modal';
import {document as documentActions} from '../../actions/document';

/**
 * An interface that defines the  'services' that are available to 
 * an editor.  'Services' can be thought of as any application level
 * function or facility. Largely this abstraction exists to allow
 * us to define document and content editors that are completely unaware
 * of the Redux dispatcher.  The service implementation (see below)
 * can effectively hide the presence and invocation of dispatch.  
 */
export interface EditorServices {

  // Request to view a document with the specified document id.
  viewDocument: (documentId: types.DocumentId) => void;

  // Display the given component in a modal dialog.
  displayModal: (component: any) => void;

  // Dismiss the modal dialog. 
  dismissModal: () => void;

}

export interface DispatchBasedServices {
  dispatch;
}

export class DispatchBasedServices implements EditorServices {
  
  constructor(dispatch) {
    this.dispatch = dispatch;
  }

  viewDocument(documentId: string) {
    this.dispatch(documentActions.viewDocument(documentId));
  }

  displayModal(component: any) {
    this.dispatch(modalActions.display(component));
  }
  
  dismissModal() {
  this.dispatch(modalActions.dismiss());
  }


}