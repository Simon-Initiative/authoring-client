import { requestActions } from '../actions/requests';
import { OtherAction } from './utils';

type RequestAction = 
  requestActions.startRequestAction |
  requestActions.endRequestAction |
  OtherAction;

export function requests(state : requestActions.startRequestAction[] = [], action: RequestAction) {
  switch (action.type) {
    case requestActions.START_REQUEST:
      return [...state, action];
    case requestActions.END_REQUEST:
      return state.filter(a => a.id !== action.id);
    default:
      return state;
  }
}
