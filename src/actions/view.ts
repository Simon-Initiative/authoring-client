import history from 'utils/history';
import * as models from 'data/models';
import { dismissScopedMessages } from './messages';
import { Scope } from 'types/messages';
import * as courseActions from 'actions/course';
import * as orgActions from 'actions/orgs';
import { LegacyTypes } from 'data/types';

function isDifferentCourse(getState, courseId): boolean {
  const course: models.CourseModel = getState().course;
  return course === null || course.guid !== courseId;
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

function transitionCourseView(destination, courseId, dispatch, getState) {

  if (isDifferentCourse(getState, courseId)) {

    dispatch(dismissScopedMessages(Scope.Package));

    dispatch(courseActions.loadCourse(courseId)).then((c) => {
      history.push(destination);
    });
  } else {
    dispatch(dismissScopedMessages(Scope.Resource));
    history.push(destination);
  }

}

function transitionApplicationView(destination, dispatch) {
  dispatch(dismissScopedMessages(Scope.Application));
  dispatch(enterApplicationView());
  history.push(destination);
}


export type ViewActions = {
  viewCreateCourse: () => void,
  viewImportCourse: () => void,
  viewAllCourses: () => void,
  viewDocument: (documentId: string, courseId: string, orgId?: string) => void,
  viewSkills: (courseId: string) => void,
  viewObjectives: (courseId: string) => void,
  viewOrganizations: (courseId: string) => void,
  viewPages: (courseId: string) => void,
  viewFormativeAssessments: (courseId: string) => void,
  viewSummativeAssessments: (courseId: string) => void,
  viewFeedbackAssessments: (courseId: string) => void,
  viewPools: (courseId: string) => void,
};

// The view transition actions:

export function viewCreateCourse() {
  return transitionApplicationView.bind(undefined, '/create');
}

export function viewImportCourse() {
  return transitionApplicationView.bind(undefined, '/import');
}

export function viewDocument(documentId: string, courseId: string, orgId?: string) {
  return transitionCourseView
    .bind(
      undefined,
      '/' + documentId + '-' + courseId + (orgId ? '-' + orgId : ''),
      courseId,
    );
}

export function viewSkills(courseId: string) {
  return transitionCourseView
    .bind(undefined, '/skills-' + courseId, courseId);
}

export function viewPages(courseId: string) {
  return transitionCourseView
    .bind(undefined, '/pages-' + courseId, courseId);
}

export function viewFormativeAssessments(courseId: string) {
  return transitionCourseView
    .bind(undefined, '/formativeassessments-' + courseId, courseId);
}

export function viewSummativeAssessments(courseId: string) {
  return transitionCourseView
    .bind(undefined, '/summativeassessments-' + courseId, courseId);
}

export function viewFeedbackAssessments(courseId: string) {
  return transitionCourseView
    .bind(undefined, '/feedbackassessments-' + courseId, courseId);
}

export function viewOrganizations(courseId: string) {
  return transitionCourseView
    .bind(undefined, '/organizations-' + courseId, courseId);
}

export function viewObjectives(courseId: string) {
  return transitionCourseView
    .bind(undefined, '/objectives-' + courseId, courseId);
}

export function viewPools(courseId: string) {
  return transitionCourseView
    .bind(undefined, '/pools-' + courseId, courseId);
}

export function viewAllCourses() {
  return transitionApplicationView.bind(undefined, '/');
}


export function viewCourse(courseId: string) {
  return function (dispatch, getState) {
    dispatch(courseActions.loadCourse(courseId)).then((c) => {

      // This ensures that we wipe any messages displayed from
      // another course
      dispatch(dismissScopedMessages(Scope.Package));

      // Make sure we have an org active and that it pertains to
      // this course
      const model: models.CourseModel = c as models.CourseModel;
      const orgs = model.resources.toArray().filter(r => r.type === LegacyTypes.organization);

      getState().orgs.documentId.caseOf({
        just: (documentId) => {
          // Do not use this org if it doesn't belong to this course
          const currentOrFirst = model.resources.has(documentId) ? documentId : orgs[0].guid;
          if (currentOrFirst !== documentId) {
            dispatch(orgActions.load(courseId, currentOrFirst));
          }
          dispatch(viewDocument(courseId, courseId, currentOrFirst));

        },
        nothing: () => {
          dispatch(orgActions.load(courseId, orgs[0].guid));
          dispatch(viewDocument(courseId, courseId, orgs[0].guid));
        },
      });


    });
  };
}
