import * as types from '../../data/types';

import { modalActions } from '../../actions/modal';
import * as persistence from '../../data/persistence';
import * as view from '../../actions/view';
import * as courseActions from '../../actions/course';
import * as models from '../../data/models';
import { TitleOracle, MockTitleOracle } from './TitleOracle';

/**
 * An interface that defines the  'services' that are available to 
 * an editor.  'Services' can be thought of as any application level
 * function or facility. Largely this abstraction exists to allow
 * us to define document and content editors that are completely unaware
 * of the Redux dispatcher.  The service implementation (see below)
 * can effectively hide the presence and invocation of dispatch.  
 */
export interface AppServices {

  // Request to view a document with the specified document id.
  viewDocument: (documentId: types.DocumentId, courseId: string) => void;

  // Display the given component in a modal dialog.
  displayModal: (component: any) => void;

  // Dismiss the modal dialog. 
  dismissModal: () => void;

  // Allows fetching a document by an Id, not its guid
  fetchTitleById: (internalId: string) => Promise<string>;

  fetchIdByGuid: (guid: string) => Promise<string>;

  // Provides titles for strongly identified items. 
  titleOracle: TitleOracle;

}

export interface DispatchBasedServices {
  dispatch;
  courseModel: models.CourseModel;
  titleOrace: TitleOracle;
}

export class DispatchBasedServices implements AppServices {
  
  titleOracle = new MockTitleOracle();

  constructor(dispatch, courseModel) {
    this.dispatch = dispatch;
    this.courseModel = courseModel;
  }

  viewDocument(documentId: string, courseId: string) {
    view.viewDocument(documentId, courseId);
  }

  displayModal(component: any) {
    this.dispatch(modalActions.display(component));
  }
  
  dismissModal() {
    this.dispatch(modalActions.dismiss());
  }

  fetchIdByGuid(guid: string) : Promise<string> {
    return this.fetchAttributeBy('id', 'guid', guid);
  }

  fetchTitleById(internalId: string) : Promise<string> {
    return this.fetchAttributeBy('title', 'id', internalId);
  }

  fetchAttributeBy(
    attributeToFetch: string, attributeToFindBy: string, findByValue: any) : Promise<any> {
    const find = (model) => {
      return model.resources
        .toArray()
        .find(res => res[attributeToFindBy] === findByValue);
    };

    const found = find(this.courseModel);

    if (found !== undefined && found !== null) {
      return Promise.resolve(found[attributeToFetch]);
    } else {
      return new Promise((resolve, reject) => {
        persistence.retrieveCoursePackage(this.courseModel.guid)
        .then((doc) => {

          if (doc.model.modelType === 'CourseModel') {
            const found = find(doc.model);
            if (found !== undefined && found !== null) {
              resolve(found[attributeToFetch]);

              this.dispatch(courseActions.courseChanged(doc.model));

            } else {
              reject('Could not find resource');
            }
          }
        });
      });
    }
  }
}
