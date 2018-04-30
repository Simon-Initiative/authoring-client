import * as Messages from 'types/messages';
import * as Immutable from 'immutable';
import { UserProfile } from 'types/user';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { ModalMessage } from 'utils//ModalMessage';
import { modalActions } from 'actions/modal';
import { viewObjectives } from 'actions/view';

export function buildReportProblemAction(
  failure: string, name: string, email: string) : Messages.MessageAction {

  const url = buildFeedbackFromCurrent(name, email);

  return {
    label: 'Report Problem',
    execute: (message, dispatch) => {
      window.open(url, 'ReportProblemTab');
    },
  };
}

export function buildPersistenceFailureMessage(reason: string, user: UserProfile) {

  const name = user.firstName + ' ' + user.lastName;

  if (reason === 'Bad Request') {

    const content = new Messages.TitledContent().with({
      title: 'Cannot save.',
      message: 'There was a problem saving your changes. Try reverting recent changes.',
    });
    return new Messages.Message().with({
      content,
      guid: 'PersistenceProblem',
      scope: Messages.Scope.Resource,
      severity: Messages.Severity.Error,
      canUserDismiss: false,
      actions: Immutable.List([buildReportProblemAction(reason, name, user.email)]),
    });

  }

  const content = new Messages.TitledContent().with({
    title: 'Cannot save.',
    message: 'An unknown error was encountered trying to save your changes.',
  });
  return new Messages.Message().with({
    content,
    guid: 'UnknownError',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Error,
    canUserDismiss: true,
    actions: Immutable.List([buildReportProblemAction(reason, name, user.email)]),
  });


}

function buildModalMessageAction(label, text) : Messages.MessageAction {
  return {
    label,
    execute: (message: Messages.Message, dispatch) => {
      dispatch(modalActions.display(<ModalMessage text={text}/>));
    },
  };
}

function goToObjectivesPage(label: string, courseId: string) : Messages.MessageAction {
  return {
    label,
    execute: (message: Messages.Message, dispatch) => {
      dispatch(viewObjectives(courseId));
    },
  };
}

const missingObjectivesDetails =
  'Learning objectives are necessary to create skills, which are used by the \
  learning engine to analyze question effectiveness and \
  assess student improvement over time.';

export function buildMissingObjectivesMessage(courseId: string) {

  const actions = [
    buildModalMessageAction('Learn more', missingObjectivesDetails),
    goToObjectivesPage('Create Objectives', courseId),
  ];

  const content = new Messages.TitledContent().with({
    title: 'No Course Objectives',
    message: 'Learning objectives are key to the success of a course. You should \
    create some first.',
  });

  return new Messages.Message().with({
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: false,
    actions: Immutable.List(actions),
    content,
  });
}

const missingSkillsDetails =
  'Skills are used by the learning engine to analyze question effectiveness and \
  assess student improvement over time.';

export function buildMissingSkillsMessage(courseId: string) {

  const actions = [
    buildModalMessageAction('Learn more', missingSkillsDetails),
    goToObjectivesPage('Create Skills', courseId),
  ];

  const content = new Messages.TitledContent().with({
    title: 'No Course Skills',
    message: 'Learning skills are key to the success of a course. You should create some first.',
  });

  return new Messages.Message().with({
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: false,
    actions: Immutable.List(actions),
    content,
  });
}
