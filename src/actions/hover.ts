import * as Immutable from 'immutable';

export type UPDATE_HOVER = 'hover/UPDATE_HOVER';
export const UPDATE_HOVER: UPDATE_HOVER = 'hover/UPDATE_HOVER';

export type HoverAction = {
  type: UPDATE_HOVER,
  hover: string,
};

export const updateHover = (hover: string): HoverAction => ({
  type: UPDATE_HOVER,
  hover,
});
