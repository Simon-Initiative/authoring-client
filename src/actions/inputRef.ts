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
