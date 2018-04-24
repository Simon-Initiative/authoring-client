import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import { ActiveContextState, activeContext } from 'reducers/active';

export type SET_ITEM = 'clipboard/SET_ITEM';
export const SET_ITEM: SET_ITEM = 'clipboard/SET_ITEM';

export const setItem = item => ({
  type: SET_ITEM,
  item,
});

// create clipboard reducer
// store item in clipboard reducer, on paste it will insert the item
export function cut(item: Object) {
  return function (dispatch, getState) {
    const { activeContext }: { activeContext: ActiveContextState } = getState();
    dispatch(setItem(item));
    activeContext.container.lift(parent => parent.onRemove(item));
  };
}

export function copy(item: Object) {
  return function (dispatch, getState) {
    dispatch(setItem(item));
  };
}

// paste uses getstate as a thunk, get current item, use currently
// active parent and call .onInsert(item, parent)
