import { determineServerTimeSkewInMs } from '../utils/date';

export type SERVER_TIME_SKEW = 'SERVER_TIME_SKEW';
export const SERVER_TIME_SKEW = 'SERVER_TIME_SKEW';

export type serverTimeSkewAction = {
  type: SERVER_TIME_SKEW,
  skewInMs: number,
};

export function serverTimeSkewChanged(skewInMs) : serverTimeSkewAction {
  return {
    type: SERVER_TIME_SKEW,
    skewInMs,
  };
}

export function setServerTimeSkew() {
  return function (dispatch) {
    determineServerTimeSkewInMs()
      .then(skewInMs => dispatch(serverTimeSkewChanged(skewInMs)));
  };
}
