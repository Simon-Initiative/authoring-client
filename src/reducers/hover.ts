import { List } from 'immutable';
import {
  HoverAction,
  UPDATE_HOVER,
} from 'actions/hover';
import { OtherAction } from './utils';

export type ActionTypes = HoverAction | OtherAction;
export type HoverState = string;

const initialState = null;

export const hover = (
  state: HoverState = initialState,
  action: ActionTypes,
): HoverState => {
  switch (action.type) {
    case UPDATE_HOVER:
      return action.hover;
    default:
      return state;
  }
};
