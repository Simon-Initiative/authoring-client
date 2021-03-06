import * as Messages from 'types/messages';
import * as Immutable from 'immutable';
import { UserProfile } from 'types/user';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { ModalMessage } from 'utils/ModalMessage';
import { modalActions } from 'actions/modal';
import { viewObjectives } from 'actions/view';
import * as React from 'react';
import { CourseIdVers } from 'data/types';
import { Maybe } from 'tsmonad';

export function buildReportProblemAction(
  failure: string, name: string, email: string): Messages.MessageAction {

  const url = buildFeedbackFromCurrent(name, email);

  return {
    label: 'Report Problem',
    enabled: true,
    execute: (message, dispatch) => {
      window.open(url, 'ReportProblemTab');
    },
  };
}

export function buildGeneralErrorMessage(error: string) {
  const content = new Messages.TitledContent().with({
    title: 'Something went wrong',
    message: error,
  });

  return new Messages.Message().with({
    content,
    guid: 'PersistenceConflict',
    scope: Messages.Scope.CoursePackage,
    severity: Messages.Severity.Error,
    canUserDismiss: true,
    actions: Immutable.List([buildReportProblemAction(error, '', '')]),
  });
}

export function buildConflictMessage() {

  const content = new Messages.TitledContent().with({
    title: 'Cannot save',
    message: 'Another user\'s change conflicted with yours. Please retry.',
  });
  return new Messages.Message().with({
    content,
    guid: 'PersistenceConflict',
    scope: Messages.Scope.CoursePackage,
    severity: Messages.Severity.Error,
    canUserDismiss: true,
    actions: Immutable.List(),
  });

}

export function buildPersistenceFailureMessage(
  reason: string, user: UserProfile, isntResource = false) {

  const name = user.firstName + ' ' + user.lastName;

  if (reason === 'Bad Request') {
    const content = new Messages.TitledContent().with({
      title: 'Cannot save',
      message: 'There was a problem saving your changes. Try reverting recent changes.',
    });
    return new Messages.Message().with({
      content,
      guid: 'PersistenceProblem',
      scope: isntResource ? Messages.Scope.Application : Messages.Scope.Resource,
      severity: Messages.Severity.Error,
      canUserDismiss: false,
      actions: Immutable.List([buildReportProblemAction(reason, name, user.email)]),
    });
  }

  const content = new Messages.TitledContent().with({
    title: 'Cannot save',
    message: 'An unknown error was encountered trying to save your changes.',
  });
  return new Messages.Message().with({
    content,
    guid: 'UnknownError',
    scope: isntResource ? Messages.Scope.Application : Messages.Scope.Resource,
    severity: Messages.Severity.Error,
    canUserDismiss: true,
    actions: Immutable.List([buildReportProblemAction(reason, name, user.email)]),
  });
}

function buildModalMessageAction(label, text): Messages.MessageAction {
  return {
    label,
    enabled: true,
    execute: (message: Messages.Message, dispatch) => {
      const dismiss = () => dispatch(modalActions.dismiss());
      dispatch(modalActions.display(
        <ModalMessage onCancel={dismiss}>{text}</ModalMessage>));
    },
  };
}

function goToObjectivesPage(
  label: string, courseId: CourseIdVers, orgId: string): Messages.MessageAction {
  return {
    label,
    enabled: true,
    execute: (message: Messages.Message, dispatch) => {
      viewObjectives(courseId, Maybe.just(orgId));
    },
  };
}

// tslint:disable:max-line-length
const missingObjectivesDetails =
  <React.Fragment><p>Create Learning Objectives and their component Skills on the
    Learning Objectives page of your course package.</p>
    <p>Student-centered Learning Objectives and their component Skills make an OLI course effective in a few ways:</p>
    <ul>
      <li>Learning Objectives help authors strictly align page content to a concept, helping to avoid introducing distractions that will detract from the learning experience.</li>
      <li>Learning Objectives give students a guide for the topics and skills they they can expect to learn and demonstrate.</li>
      <li>Skills enable The Learning Dashboard to give teachers insights into their students' learning states. These subcomponents of Learning Objectives get attached by you to the questions in the practice and scored assessments you build for students, so their interactions can be analyzed for instructor insights.</li>
    </ul>
  </React.Fragment>;
// tslint:enable:max-line-length

export function buildMissingObjectivesMessage(courseId: CourseIdVers, orgId: string) {

  const actions = [
    buildModalMessageAction('Learn', missingObjectivesDetails),
    goToObjectivesPage('Create', courseId, orgId),
  ];

  const content = new Messages.TitledContent().with({
    title: 'No Learning Objectives',
    // tslint:disable-next-line:max-line-length
    message: 'Your course\'s effectiveness is driven by student-centered Learning Objectives and Skills.',
  });

  return new Messages.Message().with({
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Information,
    canUserDismiss: false,
    actions: Immutable.List(actions),
    content,
  });
}

// tslint:disable:max-line-length
const missingSkillsDetails =
  <React.Fragment><p>Create Learning Objectives and their component Skills on the
    Learning Objectives page of your course package.</p>
    <p>Student-centered Learning Objectives and their component Skills make an OLI course effective in a few ways:</p>
    <ul>
      <li>Learning Objectives help authors strictly align page content to a concept, helping to avoid introducing distractions that will detract from the learning experience.</li>
      <li>Learning Objectives give students a guide for the topics and skills they they can expect to learn and demonstrate.</li>
      <li>Skills enable The Learning Dashboard to give teachers insights into their students' learning states. These subcomponents of Learning Objectives get attached by you to the questions in the practice and scored assessments you build for students, so their interactions can be analyzed for instructor insights.</li>
    </ul>
  </React.Fragment>;
// tslint:enable:max-line-length

export function buildMissingSkillsMessage(courseId: CourseIdVers, orgId: string) {

  const actions = [
    buildModalMessageAction('Learn', missingSkillsDetails),
    goToObjectivesPage('Create', courseId, orgId),
  ];

  const content = new Messages.TitledContent().with({
    title: 'No Skills',
    // tslint:disable-next-line:max-line-length
    message: 'Skills are key to the effectiveness of a course. You should create some first.',
  });

  return new Messages.Message().with({
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Information,
    canUserDismiss: false,
    actions: Immutable.List(actions),
    content,
  });
}
