import history from 'utils/history';
import * as models from 'data/models';
import { dismissScopedMessages } from './messages';
import { Scope } from 'types/messages';

function isDifferentCourse(getState, courseId) : boolean {
  const course: models.CourseModel = getState().course;
  return course === null || course.id !== courseId;
}

// Helpers for defining async view actions that dismiss
// the appropriately scoped messages:

function transitionCourseView(destination, courseId, dispatch, getState) {

  const scope = isDifferentCourse(getState, courseId)
  ? Scope.Package : Scope.Resource;
  dispatch(dismissScopedMessages(scope));

  history.push(destination);
}

function transitionApplicationView(destination, dispatch) {
  dispatch(dismissScopedMessages(Scope.Application));
  history.push(destination);
}

// The view transition actions:

export function viewCreateCourse() {
  return transitionApplicationView.bind(undefined, '/create');
}

export function viewImportCourse() {
  return transitionApplicationView.bind(undefined, '/import');
}

export function viewDocument(documentId: string, courseId: string) {
  return transitionCourseView
    .bind(undefined, '/' + documentId + '-' + courseId, courseId);
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
