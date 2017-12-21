import * as Messages from 'types/messages';
import * as Immutable from 'immutable';
import { UserProfile } from 'types/user';
import { buildFeedbackFromCurrent } from 'utils/feedback';

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
