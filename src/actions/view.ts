import * as models from 'data/models';
import { dismissScopedMessages } from './messages';
import { Scope } from 'types/messages';
import * as courseActions from 'actions/course';
import * as orgActions from 'actions/orgs';
import { LegacyTypes } from 'data/types';
import * as router from 'actions/router';
import { State } from 'reducers';
import { Maybe } from 'tsmonad';
import { loadFromLocalStorage } from 'utils/localstorage';
import { activeOrgUserKey, ACTIVE_ORG_STORAGE_KEY } from './utils/activeOrganization';

function isDifferentCourse(getState, courseId): boolean {
  const course: models.CourseModel = getState().course;
  return course === null || course.guid !== courseId;
}

function isDifferentOrg(getState: () => State, orgId): boolean {
  const { course } = getState();
  return getState().router.orgId.caseOf({
    just: id => course.resourcesById.has(id)
      && course.resourcesById.get(id).type === LegacyTypes.organization
      && orgId !== id,
    nothing: () => true,
  });
}


export type ENTER_APPLICATION_VIEW = 'ENTER_APPLICATION_VIEW';
export const ENTER_APPLICATION_VIEW: ENTER_APPLICATION_VIEW = 'ENTER_APPLICATION_VIEW';

export type EnterApplicationViewAction = {
  type: ENTER_APPLICATION_VIEW,
};

function enterApplicationView(): EnterApplicationViewAction {
  return {
    type: ENTER_APPLICATION_VIEW,
  };
}

// Helpers for defining async view actions that dismiss
// the appropriately scoped messages:

function transitionCourseView(destination, courseId, orgId, dispatch, getState) {

  if (isDifferentCourse(getState, courseId)) {

    dispatch(dismissScopedMessages(Scope.Package));

    dispatch(courseActions.loadCourse(courseId)).then((c) => {
      dispatch(orgActions.releaseOrg());
      router.push(destination);
    });
  } else if (isDifferentOrg(getState, orgId)) {
    dispatch(orgActions.releaseOrg());
    dispatch(orgActions.load(courseId, orgId));
    dispatch(dismissScopedMessages(Scope.Organization));
    router.push(destination);
  } else {
    dispatch(dismissScopedMessages(Scope.Resource));
    router.push(destination);
  }

}

function transitionApplicationView(destination, dispatch) {
  dispatch(dismissScopedMessages(Scope.Application));
  dispatch(enterApplicationView());
  router.push(destination);
}


export type ViewActions = {
  viewCreateCourse: () => void,
  viewImportCourse: () => void,
  viewAllCourses: () => void,
  viewDocument: (documentId: string, courseId: string, orgId: string) => void,
  viewSkills: (courseId: string, orgId: string) => void,
  viewObjectives: (courseId: string, orgId: string) => void,
  viewOrganizations: (courseId: string, orgId: string) => void,
  viewAllResources: (courseId: string, orgId: string) => void,
};

// The view transition actions:

export function viewCreateCourse() {
  return transitionApplicationView.bind(undefined, '/create');
}

export function viewImportCourse() {
  return transitionApplicationView.bind(undefined, '/import');
}

export function viewDocument(documentId: string, courseId: string, orgId: string) {
  return transitionCourseView
    .bind(
      undefined,
      '/' + documentId + '-' + courseId + (orgId ? '-' + orgId : ''),
      courseId, orgId,
    );
}

export function viewSkills(courseId: string, orgId: string) {
  return transitionCourseView
    .bind(undefined, '/skills-' + courseId + '-' + orgId, courseId, orgId);
}

export function viewAllResources(courseId: string, orgId: string) {
  return transitionCourseView
    .bind(undefined, '/resources-' + courseId + '-' + orgId, courseId, orgId);
}

export function viewOrganizations(courseId: string, orgId: string) {
  return transitionCourseView
    .bind(undefined, '/organizations-' + courseId + '-' + orgId, courseId, orgId);
}

export function viewObjectives(courseId: string, orgId: string) {
  return transitionCourseView
    .bind(undefined, '/objectives-' + courseId + '-' + orgId, courseId, orgId);
}

export function viewAllCourses() {
  return transitionApplicationView.bind(undefined, '/');
}


export function viewCourse(courseId: string) {
  return function (dispatch, getState: () => State) {
    dispatch(courseActions.loadCourse(courseId)).then((c) => {

      // This ensures that we wipe any messages displayed from
      // another course
      dispatch(dismissScopedMessages(Scope.Package));

      // Make sure we have an org active and that it pertains to
      // this course
      const model: models.CourseModel = c as models.CourseModel;
      const orgs = model.resources.toArray().filter(r => r.type === LegacyTypes.organization);

      getState().router.orgId.caseOf({
        just: (documentId) => {
          // Do not use this org if it doesn't belong to this course
          const currentOrFirst = model.resources.has(documentId) ? documentId : orgs[0].guid;
          if (currentOrFirst !== documentId) {
            dispatch(orgActions.releaseOrg());
            dispatch(orgActions.load(courseId, currentOrFirst));
          }
          dispatch(viewDocument(courseId, courseId, currentOrFirst));

        },
        nothing: () => {
          dispatch(orgActions.releaseOrg());
          let savedOrg;
          Maybe.maybe(loadFromLocalStorage(ACTIVE_ORG_STORAGE_KEY))
            .lift((prefs) => {
              const username = getState().user.profile.username;
              const userKey = activeOrgUserKey(username, courseId);
              if (prefs[userKey]) {
                savedOrg = orgs.find(res => res.guid === prefs[userKey]);
              }
            });
          const orgGuid = savedOrg ? savedOrg.guid : orgs[0].guid;
          dispatch(orgActions.load(courseId, orgGuid));
          dispatch(viewDocument(courseId, courseId, orgGuid));
        },
      });
    });
  };
}
