import * as types from 'data/types';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { modalActions } from 'actions/modal';
import * as docActions from 'actions/document';
import * as persistence from 'data/persistence';
import * as contentTypes from 'data/contentTypes';
import * as view from 'actions/view';
import * as courseActions from 'actions/course';
import * as messageActions from 'actions/messages';
import * as models from 'data/models';
import * as Messages from 'types/messages';
import guid from 'utils/guid';
import { ContentElement } from 'data/content/common/interfaces';
import { MapFn } from 'data/utils/map';
import { fetchSkills } from 'actions/skills';
import { fetchObjectives } from 'actions//objectives';
import { NEW_PAGE_CONTENT } from 'data/models/workbook';

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
  viewDocument: (documentId: types.DocumentId, courseId: types.CourseIdVers,
    orgId: Maybe<types.ResourceId>) => void;

  displayMessage: (message: Messages.Message) => void;

  dismissMessage: (message: Messages.Message) => void;

  createWorkbookPage: (title: string, courseId: types.CourseIdVers) =>
    Promise<persistence.Document>;

  createAssessment: (title: string, courseId: types.CourseIdVers) =>
    Promise<persistence.Document>;

  // Display the given component in a modal dialog.
  displayModal: (component: JSX.Element) => void;

  // Dismiss the modal dialog.
  dismissModal: () => void;

  // Fetch a title by id
  fetchTitleById: (internalId: types.ResourceId) => Promise<string>;

  // Fetch an id by guid
  fetchIdByGuid: (guid: types.ResourceGuid) => Promise<types.ResourceId>;

  // Fetch guid by an id
  fetchGuidById: (id: types.ResourceId) => Promise<types.ResourceGuid>;

  // Fetch a content element in the current resource
  // by its id
  fetchContentElementById: (docId: types.DocumentId, id: string) =>
    Promise<Maybe<ContentElement>>;

  fetchContentElementByGuid: (docId: types.DocumentId, guid: string) =>
    Promise<Maybe<ContentElement>>;

  // Fetch a colleciton of attributes by some other attribute,
  // returns an object whose keys are the attributes requested
  fetchAttributesBy(
    attributesToFetch: string[], attributeToFindBy: string, findByValue: any): Promise<any>;

  updateCourseResource: (resource: contentTypes.Resource) => void;

  refreshSkills: (courseId: types.CourseIdVers) => void;

  refreshObjectives: (courseId: types.CourseIdVers) => void;

  refreshCourse: (courseId: types.CourseIdVers) => void;

  mapAndSave: (fn: MapFn, documentId: types.DocumentId) => void;
}

export interface DispatchBasedServices {
  dispatch;
  courseModel: models.CourseModel;
}

export class DispatchBasedServices implements AppServices {
  constructor(dispatch, courseModel: models.CourseModel) {
    this.dispatch = dispatch;
    this.courseModel = courseModel;
  }


  displayMessage(message: Messages.Message) {
    this.dispatch(messageActions.showMessage(message));
  }

  dismissMessage(message: Messages.Message) {
    this.dispatch(messageActions.dismissSpecificMessage(message));
  }

  viewDocument(documentId: types.DocumentId,
    courseId: types.CourseIdVers, orgId: Maybe<types.ResourceId>) {
    view.viewDocument(documentId, courseId, orgId);
  }

  createWorkbookPage(title: string, courseId: types.CourseIdVers):
    Promise<persistence.Document> {
    const resource = models.WorkbookPageModel.createNew(
      guid(), 'New Page', NEW_PAGE_CONTENT);
    return this.createResource(courseId, resource);
  }

  createAssessment(title: string, courseId: types.CourseIdVers):
    Promise<persistence.Document> {
    const resource = new models.AssessmentModel({
      type: types.LegacyTypes.assessment2,
      title: contentTypes.Title.fromText(title),
    });
    return this.createResource(courseId, resource);
  }

  displayModal(component: JSX.Element) {
    this.dispatch(modalActions.display(component));
  }

  dismissModal() {
    this.dispatch(modalActions.dismiss());
  }

  updateCourseResource(resource: contentTypes.Resource) {
    this.dispatch(courseActions.updateCourseResources(
      Immutable.OrderedMap<string, contentTypes.Resource>([[resource.guid, resource]])));
  }

  refreshSkills(courseId: types.CourseIdVers) {
    this.dispatch(fetchSkills(courseId));
  }

  refreshObjectives(courseId: types.CourseIdVers) {
    this.dispatch(fetchObjectives(courseId));
  }

  refreshCourse(courseId: types.CourseIdVers) {
    this.dispatch(courseActions.loadCourse(courseId));
  }

  fetchIdByGuid(guid: types.ResourceGuid): Promise<types.ResourceId> {
    return this.fetchAttributesBy(['id'], 'guid', guid)
      .then(o => o.id);
  }

  fetchGuidById(id: types.ResourceId): Promise<types.ResourceGuid> {
    return this.fetchAttributesBy(['guid'], 'id', id)
      .then(o => o.guid);
  }

  fetchTitleById(internalId: types.ResourceId): Promise<string> {
    return this.fetchAttributesBy(['title'], 'id', internalId)
      .then(o => o.title);
  }

  fetchContentElementById(documentId: types.DocumentId, id: string)
    : Promise<Maybe<ContentElement>> {
    return this.dispatch(docActions.fetchContentElementById(documentId, id));
  }

  fetchContentElementByGuid(documentId: types.DocumentId, guid: string)
    : Promise<Maybe<ContentElement>> {
    return this.dispatch(docActions.fetchContentElementByGuid(documentId, guid));
  }

  mapAndSave(fn: MapFn, documentId: types.DocumentId) {
    this.dispatch(docActions.mapAndSave(fn, documentId));
  }

  createResource(courseId: types.CourseIdVers, resource):
    Promise<persistence.Document> {
    return new Promise((resolve, reject) => {

      let creationResult: persistence.Document = null;
      persistence.createDocument(courseId, resource)
        .then((result: persistence.Document) => {
          creationResult = result;

          return persistence.retrieveCoursePackage(courseId);

        })
        .then((document) => {
          // Get an updated course content package payload
          if (document.model.modelType === models.ModelTypes.CourseModel) {
            this.dispatch(courseActions.courseChanged(document.model));
          }

          resolve(creationResult);
        });
    });
  }

  fetchAttributesBy(
    attributesToFetch: string[], attributeToFindBy: string, findByValue: any): Promise<any> {

    const find = (model) => {
      return model.resources
        .toArray()
        .find(res => res[attributeToFindBy] === findByValue);
    };
    const extract = found => attributesToFetch
      .map(a => [a, found[a]])
      .reduce(
        (p, c) => {
          p[c[0]] = c[1];
          return p;
        },
        {});

    const found = find(this.courseModel);

    if (found !== undefined && found !== null) {
      return Promise.resolve(extract(found));
    }

    return new Promise((resolve, reject) => {
      persistence.retrieveCoursePackage(this.courseModel.idvers)
        .then((doc) => {

          if (doc.model.modelType === 'CourseModel') {
            const found = find(doc.model);
            if (found !== undefined && found !== null) {
              resolve(extract(found));

              this.dispatch(courseActions.courseChanged(doc.model));

            } else {
              reject('Could not find resource');
            }
          }
        });
    });
  }
}
