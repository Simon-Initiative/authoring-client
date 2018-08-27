import { Maybe } from 'tsmonad';
import {
  SetActiveItemIdAction,
  SET_ACTIVE_ITEM_ID,
} from 'actions/inputRef';
import { OtherAction } from './utils';

export type ActionTypes = SetActiveItemIdAction | OtherAction;
export type InputRefState = Maybe<string>;

const initialState = Maybe.nothing<string>();

export const inputRef = (
  state: InputRefState = initialState,
  action: ActionTypes,
): InputRefState => {
  switch (action.type) {
    case SET_ACTIVE_ITEM_ID:
      return Maybe.maybe(action.activeItemId);
    default:
      return state;
  }
};
