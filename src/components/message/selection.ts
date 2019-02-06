import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import { showMessage, dismissSpecificMessage } from 'actions/messages';
import { Message, Severity, TitledContent, Scope, MessageAction } from 'types/messages';
import { IdentifiableContentElement, ContentElement } from 'data/content/common/interfaces';
import { Priority } from 'types/messages/message';

import { accessStore } from 'utils/store';

export function selectTargetElement(): Promise<Maybe<IdentifiableContentElement>> {

  const store = accessStore();

  return new Promise((resolve, reject) => {

    let previousValue = store.getState().activeContext.activeChild;

    // The continuation is the code that will run after the user clicks 'Ok' in the
    // message.  It cleans up and resolves the promise.
    const ok = (e) => {
      unsubscribe();
      resolve(Maybe.just(e));
    };
    const cancel = () => {
      unsubscribe();
      resolve(Maybe.nothing());
    };

    // We have to track changes in the activeChild (triggered by the user selecting elements)
    // On each change, we update the already displayed message
    const unsubscribe = store.subscribe(() => {
      const currentValue = store.getState().activeContext.activeChild;

      if (previousValue !== currentValue) {
        previousValue = currentValue;
        const message = createTargetSelectionMessage(currentValue, ok, cancel);
        store.dispatch(showMessage(message));
      }
    });

    // Display the initial message
    const message = createTargetSelectionMessage(previousValue, ok, cancel);
    store.dispatch(showMessage(message));
  });


}

type OkContinuation =
  (e: IdentifiableContentElement) => void;


type CancelContinuation =
  () => void;

// Creates the message shown to instruct the user to
// select an item to target
//
function createTargetSelectionMessage(
  currentSelection: Maybe<ContentElement>,
  ok: OkContinuation, cancel: CancelContinuation): Message {

  // We customize the message based on whether an item is
  // selected or not
  const message = currentSelection.caseOf({
    just: (o) => {
      if (o.id !== undefined) {
        return 'Selected item: ' + o.contentType;
      }
      return 'Item is not targetable: ' + o.contentType;
    },
    nothing: () =>
      'Pick an element to target',
  });

  const content = new TitledContent().with({
    title: 'Select target',
    message,
  });

  const actions = Immutable.List<MessageAction>([
    {
      label: 'OK',
      enabled: currentSelection.caseOf({ just: v => v.id !== undefined, nothing: () => false }),
      execute: (message, dispatch) => {
        dispatch(dismissSpecificMessage(message));
        ok(currentSelection.caseOf({ just: v => v, nothing: () => null }));
      },
    },
    {
      label: 'Cancel',
      enabled: true,
      execute: (message, dispatch) => {
        dispatch(dismissSpecificMessage(message));
        cancel();
      },
    },
  ]);

  const m = new Message().with({
    severity: Severity.Task,
    scope: Scope.Resource,
    priority: Priority.Highest,
    guid: 'TARGET_SELECTION_MESSAGE',
    canUserDismiss: false,
    content,
    actions,
  });

  return m;
}
