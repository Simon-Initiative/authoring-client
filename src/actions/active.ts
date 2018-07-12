import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import { ActiveContextState } from 'reducers/active';
import { ParsedContent } from 'data/parsers/common/types';
import * as contentTypes from 'data/contentTypes';
import { resolveWithProgressUI } from 'actions/progress';

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


export function insert(content: Object) {
  return function (dispatch, getState) {

    const { activeContext } = getState();

    activeContext.container.lift((parent : ParentContainer) => {
      parent.onAddNew(content, activeContext.textSelection);
    });

  };
}

export function insertParsedContent(resourcePath: string, parsedContent: ParsedContent) {

  return function (dispatch, getState) {

    const { activeContext, course } = getState();
    const courseId = course.guid;

    activeContext.container.lift((parent : ParentContainer) => {

      // If we have dependencies to resolve, we first present the user with a UI
      // allowing them to track the resolution progress
      if (parsedContent.dependencies.size > 0) {

        resolveWithProgressUI(
          dispatch,
          parsedContent,
          courseId,
          resourcePath,
          (e) => {
            parent.onAddNew(e.toArray(), activeContext.textSelection);
          });

      } else {
        // Otherwise, just add the elements
        parent.onAddNew(parsedContent.elements.toArray(), activeContext.textSelection);
      }
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
