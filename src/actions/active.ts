import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';

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
