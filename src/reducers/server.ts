import * as serverActions from '../actions/server';
import * as models from '../data/models';
import { OtherAction } from './utils';

type ServerActions =
    serverActions.serverTimeSkewAction |
    OtherAction;

export type ServerInformation = {
  timeSkewInMs: number,
};

export function server(state = { timeSkewInMs: 0 }, action: ServerActions): ServerInformation {
  switch (action.type) {
    case serverActions.SERVER_TIME_SKEW:
      return { timeSkewInMs: action.skewInMs };
    default:
      return state;
  }
}
