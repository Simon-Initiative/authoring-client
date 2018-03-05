import { ParentContainer } from 'types/active';

export type UPDATE_CONTENT = 'active/UPDATE_CONTENT';
export const UPDATE_CONTENT: UPDATE_CONTENT = 'active/UPDATE_CONTENT';

export type UpdateContentAction = {
  type: UPDATE_CONTENT,
  documentId: string,
  content: Object,
};

export const updateContent = (
  documentId: string, content: Object): UpdateContentAction => ({
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
};

export const updateContext = (
  documentId: string, content: Object, container: ParentContainer): UpdateContextAction => ({
    type: UPDATE_CONTEXT,
    documentId,
    content,
    container,
  });


export function insert(content: Object) {
  return function (dispatch, getState) {

    const { activeContext } = getState();
    activeContext.container.lift((parent : ParentContainer) => {
      parent.onAddNew(content);
    });
  };
}

export function edit(content: Object) {
  return function (dispatch, getState) {

    const text = content as any;
    console.log('edit view of content:');
    console.log(text.content.getFirstBlock().getText());

    const { activeContext } = getState();
    activeContext.container.lift((parent : ParentContainer) => {
      parent.onEdit(content, content);
    });
  };
}

