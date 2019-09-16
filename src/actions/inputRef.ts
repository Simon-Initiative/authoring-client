import { InputRef } from 'data/content/learning/input_ref';
import { Editor, Inline } from 'slate';

export type SET_ACTIVE_ITEM_ID = 'inputRef/SET_ACTIVE_ITEM_ID';
export const SET_ACTIVE_ITEM_ID: SET_ACTIVE_ITEM_ID = 'inputRef/SET_ACTIVE_ITEM_ID';

export type SetActiveItemIdAction = {
  type: SET_ACTIVE_ITEM_ID,
  activeItemId: string,
};

export const setActiveItemIdActionAction = (activeItemId: string): SetActiveItemIdAction => ({
  type: SET_ACTIVE_ITEM_ID,
  activeItemId,
});


function insertInline(editor: Editor, wrapper: InputRef) {
  const inline = Inline.create({ data: { value: wrapper }, type: wrapper.contentType });
  return editor.insertInline(inline);
}


export function insertInputRef(inputRef: InputRef) {
  return function (dispatch, getState) {
    const { activeContext } = getState();
    activeContext.editor.lift(e => insertInline(e, inputRef));

    // A weird hack that for some reason seems necessary.  If the action is
    // dispatched within the same exeution context as the editor change, the
    // component renders nothing - not even the input ref addition.
    setTimeout(() => dispatch(setActiveItemIdActionAction(inputRef.input), 200));
  };
}
