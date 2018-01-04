import * as serverActions from '../actions/server';
import { OtherAction } from './utils';

type ServerActions =
    serverActions.serverTimeSkewAction |
    OtherAction;

export type ServerState = {
  timeSkewInMs: number,
};

export function server(
  state: ServerState = { timeSkewInMs: 0 },
  action: ServerActions,
): ServerState {
  switch (action.type) {
    case serverActions.SERVER_TIME_SKEW:
      return { timeSkewInMs: action.skewInMs };
    default:
      return state;
  }
}
