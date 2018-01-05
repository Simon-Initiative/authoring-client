import { requestActions } from '../actions/requests';
import { OtherAction } from './utils';

type RequestAction =
  requestActions.startRequestAction |
  requestActions.endRequestAction |
  OtherAction;

export type RequestsState = requestActions.startRequestAction[];

export function requests(
  state: RequestsState = [],
  action: RequestAction,
): RequestsState {
  switch (action.type) {
    case requestActions.START_REQUEST:
      return [...state, action];
    case requestActions.END_REQUEST:
      return state.filter(a => a.id !== action.id);
    default:
      return state;
  }
}
