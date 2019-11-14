import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import { ActiveContextState } from 'reducers/active';
import { ParsedContent } from 'data/parsers/common/types';
import * as contentTypes from 'data/contentTypes';
import { resolveWithProgressUI } from 'actions/progress';
import { ContentElement } from 'data/content/common/interfaces';
import { validateRemoval } from 'data/models/utils/validation';
import { displayModalMessasge } from 'utils/message';
import { Editor, Inline } from 'slate';
import { removeInlineEntity }
  from 'editors/content/learning/contiguoustext/utils';

export type UPDATE_CONTENT = 'active/UPDATE_CONTENT';
export const UPDATE_CONTENT: UPDATE_CONTENT = 'active/UPDATE_CONTENT';

export type UpdateContentAction = {
  type: UPDATE_CONTENT,
  documentId: string,
  content: ContentElement,
};

export const updateContent = (
  documentId: string,
  content: ContentElement): UpdateContentAction => ({
    type: UPDATE_CONTENT,
    documentId,
    content,
  });

export type SELECT_INLINE = 'active/SELECT_INLINE';
export const SELECT_INLINE: SELECT_INLINE = 'active/SELECT_INLINE';

export type SelectInlineAction = {
  type: SELECT_INLINE,
  inline: Maybe<Inline>,
};

export const selectInline = (
  inline: Maybe<Inline>): SelectInlineAction => ({
    type: SELECT_INLINE,
    inline,
  });

export type UPDATE_EDITOR = 'active/UPDATE_EDITOR';
export const UPDATE_EDITOR: UPDATE_EDITOR = 'active/UPDATE_EDITOR';

export type UpdateEditorAction = {
  type: UPDATE_EDITOR,
  editor: Editor,
};

export const updateEditor = (
  editor: Editor): UpdateEditorAction => ({
    type: UPDATE_EDITOR,
    editor,
  });


export type UPDATE_CONTEXT = 'active/UPDATE_CONTEXT';
export const UPDATE_CONTEXT: UPDATE_CONTEXT = 'active/UPDATE_CONTEXT';

export type UpdateContextAction = {
  type: UPDATE_CONTEXT,
  documentId: string,
  content: ContentElement,
  container: ParentContainer,
  textSelection: Maybe<TextSelection>,
};

export const updateContext = (
  documentId: string,
  content: ContentElement,
  container: ParentContainer,
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


/**
 * Insert element action.
 * @param content The element to insert
 * @param contextSnapshot Optional, a snapshot of the active context to use
 *
 */
export function insert(
  content: ContentElement | ContentElement[],
  contextSnapshot = null) {
  return function (dispatch, getState) {

    const activeContext = contextSnapshot === null
      ? getState().activeContext
      : contextSnapshot;

    activeContext.container.lift((parent: ParentContainer) => {
      parent.onAddNew(content, activeContext.editor);
    });

  };
}

export function insertParsedContent(resourcePath: string, parsedContent: ParsedContent) {

  return function (dispatch, getState) {

    const { activeContext, course } = getState();
    const courseId = course.guid;

    activeContext.container.lift((parent: ParentContainer) => {

      // If we have dependencies to resolve, we first present the user with a UI
      // allowing them to track the resolution progress
      if (parsedContent.dependencies.size > 0) {

        resolveWithProgressUI(
          dispatch,
          parsedContent,
          courseId,
          resourcePath,
          (e) => {
            parent.onAddNew(e.toArray(), activeContext.editor);
          });

      } else {
        // Otherwise, just add the elements
        parent.onAddNew(parsedContent.elements.toArray(),
          activeContext.editor);
      }
    });

  };

}


export function edit(content: ContentElement) {
  return function (dispatch, getState) {
    const { activeContext } = getState();
    activeContext.container.lift((parent: ParentContainer) => {
      parent.onEdit(content, content);

    });
  };
}

export function remove(item: ContentElement) {
  return function (dispatch, getState) {
    const { activeContext }: { activeContext: ActiveContextState } = getState();
    const { documents } = getState();

    if (!validateRemoval(documents.first().document.model, item)) {
      displayModalMessasge(
        dispatch,
        'Removing this element would leave one or more command elements untargetted.');
      return;
    }

    const container: ParentContainer = activeContext.container.caseOf({
      just: container => container,
      nothing: () => undefined,
    });

    dispatch(resetActive());

    activeContext.editor.caseOf({
      just: (e) => {
        if (item instanceof contentTypes.ContiguousText) {
          activeContext.activeInline.caseOf({
            just: (en) => {
              removeInlineEntity(e, en.key);
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
