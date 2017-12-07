import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';
import * as Messages from 'types/messages';
import { ModalMessage } from 'utils//ModalMessage';
import { modalActions } from 'actions/modal';

// Helper UI function for rendering the lock display for any type of editor

export type LockDetails = {
  lockedBy: string;
  lockedAt: number;
};

function buildModalMessageAction(label, text) : Messages.MessageAction {
  return {
    label,
    execute: (message: Messages.Message, dispatch) => {
      dispatch(modalActions.display(<ModalMessage text={text}/>));
    },
  };
}

export function buildReadOnlyMessage(lockDetails: LockDetails, retryAction) {

  const payload = new Messages.DetailedMessagePayload().with({
    title: 'Read only',
    message: 'User ' + lockDetails.lockedBy + ' is currently editing.',
    actions: Immutable.List([buildModalMessageAction('Learn more', readOnlyDetails), retryAction]),
  });
  return new Messages.Message().with({
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: false,
    payload,
  });

}

const expiredDetails =
  'The OLI authoring platform allows multiple users to author and edit course '
  + 'materials.  To prevent loss of data, the system eliminates the possibility '
  + 'that two users can concurrently edit the same course resource (e.g. page, assessment) '
  + 'by requiring a user to first \'lock\' a resource before editing it. '
  + '\n\nThis lock, however, will expire after ten minutes of inactivity by the user.'
  + '\n\nThis appears to have happened to you.  To continue editing, please refresh '
  + 'your browser page and load the course resource again.';


const readOnlyDetails =
  'The OLI authoring platform allows multiple users to author and edit course '
  + 'materials.  To prevent loss of data, the system eliminates the possibility '
  + 'that two users can concurrently edit the same course resource (e.g. page, assessment) '
  + 'by requiring a user to first \'lock\' a resource before editing it. '
  + '\n\nAnother user currently has this resource locked. When they finish editing'
  + '\n\nthis lock will be released and you can then begin editing. You will not '
  + 'automatically be notified that they are done editing. You will have to refresh '
  + 'your browser and revisit this resource to determine if they are done editing.';


export function buildLockExpiredMessage(retryAction) {

  const payload = new Messages.DetailedMessagePayload().with({
    title: 'Write lock expired',
    message: 'The time limit of your exclusive editing has expired.',
    actions: Immutable.List([buildModalMessageAction('Learn more', readOnlyDetails), retryAction]),
  });
  return new Messages.Message().with({
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: false,
    payload,
  });

}

export function renderLocked(lockDetails: LockDetails) {

  const message = lockDetails === null
    ? 'The time limit of your exclusive access for editing this page has expired.\n\n'
      + 'Reload this page to attempt to continue editing'
    : 'The contents of this page is being edited by ' + lockDetails.lockedBy;

  return (
    <div className="container">
      <div className="row">
        <div className="col-2">
          &nbsp;
        </div>
        <div className="col-8">
          <div className="alert alert-warning" role="alert">
            <strong>Read Only</strong>&nbsp;&nbsp;
            {message}
          </div>
        </div>
        <div className="col-2">
          &nbsp;
        </div>
      </div>

    </div>
  );
}
