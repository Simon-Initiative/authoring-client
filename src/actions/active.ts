import { ParentContainer, TextSelection } from 'types/active';
import { Clipboard } from 'types/clipboard';
import { Maybe } from 'tsmonad';
import { ActiveContextState } from 'reducers/active';
import * as contentTypes from 'data/contentTypes';

export type UPDATE_CONTENT = 'active/UPDATE_CONTENT';
export const UPDATE_CONTENT: UPDATE_CONTENT = 'active/UPDATE_CONTENT';

export type UpdateContentAction = {
  type: UPDATE_CONTENT,
  documentId: string,
  content: Object,
};

export const updateContent = (
  documentId: string,
  content: Object): UpdateContentAction => ({
    type: UPDATE_CONTENT,
    documentId,
    content,
  });


export type UPDATE_CONTEXT = 'active/UPDATE_CONTEXT';
export const UPDATE_CONTEXT: UPDATE_CONTEXT = 'active/UPDATE_CONTEXT';

export type UpdateContextAction = {
  type: UPDATE_CONTEXT,
  documentId: string,
  content: Object,
  container: ParentContainer,
  textSelection: Maybe<TextSelection>,
};

export const updateContext = (
  documentId: string,
  content: Object, container: ParentContainer,
  textSelection: Maybe<TextSelection>): UpdateContextAction => ({
    type: UPDATE_CONTEXT,
    documentId,
    content,
    container,
    textSelection,
  });


export type RESET_ACTIVE = 'active/RESET_ACTIVE';
export const RESET_ACTIVE: RESET_ACTIVE = 'active/RESET_ACTIVE';

export type ResetActiveAction = {
  type: RESET_ACTIVE,
};

export const resetActive = (): ResetActiveAction => ({
  type: RESET_ACTIVE,
});


export function insert(content: Object, textSelection: Maybe<TextSelection>) {
  return function (dispatch, getState) {

    const { activeContext } = getState();
    activeContext.container.lift((parent : ParentContainer) => {
      parent.onAddNew(content, textSelection);
    });
  };
}

export function edit(content: Object) {
  return function (dispatch, getState) {
    const { activeContext } = getState();
    activeContext.container.lift((parent : ParentContainer) => {
      parent.onEdit(content, content);
    });
  };
}

export function paste() {
  return function (dispatch, getState) {
    const { activeContext }: { activeContext: ActiveContextState } = getState();
    const { clipboard }: { clipboard: Clipboard } = getState();
    clipboard.item.caseOf({
      // just: item => dispatch(insert(item, Maybe.nothing())),
      just: item => activeContext.container.caseOf({
        // paste in parent after selected item
        just: parent => parent.onDuplicate(item),
        // paste at end
        nothing: () => {},
      }),
      nothing: () => {},
    });
  };
}

export function remove(item: Object) {
  return function (dispatch, getState) {
    const { activeContext }: { activeContext: ActiveContextState } = getState();

    const container: ParentContainer = activeContext.container.caseOf({
      just: container => container,
      nothing: () => undefined,
    });

    dispatch(resetActive());

    activeContext.textSelection.caseOf({
      just: (textSelection) => {
        if (item instanceof contentTypes.ContiguousText) {
          const text = item as contentTypes.ContiguousText;
          const entity = text.getEntityAtCursor(textSelection);
          entity.caseOf({
            just: (e) => {
              const updated = text.removeEntity(e.key);
              container.onEdit(updated, updated);
            },
            nothing: () => container.onRemove(item),
          });
        } else {
          container.onRemove(item);
        }
      },
      nothing: () => {
        container.onRemove(item);
      },
    });
  };
}
