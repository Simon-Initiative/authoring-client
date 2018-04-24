import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import { ActiveContextState } from 'reducers/active';
import { insert } from 'actions/active';
import { Clipboard } from 'types/clipboard';

export type SET_ITEM = 'clipboard/SET_ITEM';
export const SET_ITEM: SET_ITEM = 'clipboard/SET_ITEM';

export type SetItemAction = {
  type: SET_ITEM;
  item: Maybe<Object>;
};

export const setItem = item => ({
  type: SET_ITEM,
  item,
});

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
