import * as types from '../../data/types';

import {modalActions} from '../../actions/modal';
import {document as documentActions} from '../../actions/document';

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