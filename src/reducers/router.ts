import { Map, Record } from 'immutable';
import {
  UpdateRouteAction,
  UPDATE_ROUTE_ACTION,
  ResetRouteAction,
  RESET_ROUTE_ACTION,
} from 'actions/router';
import { OtherAction } from './utils';
import { toRouteRoot, RouteOption } from 'types/router';

export type ActionTypes = UpdateRouteAction
  | ResetRouteAction
  | OtherAction;

interface RouterStateParams {
  path: string;
  params: Map<string, string>;
  route: RouteOption;
}

const defaults = (params: Partial<RouterStateParams> = {}): RouterStateParams => ({
  path: params.path || '',
  params: params.params || Map<string, string>(),
  route: params.route || toRouteRoot(),
});

export class RouterState extends Record(defaults()) implements RouterStateParams {
  path: string;
  params: Map<string, string>;
  route: RouteOption;

  constructor(params?: Partial<RouterStateParams>) {
    super(defaults(params));
  }

  with(values: Partial<RouterStateParams>) {
    return this.merge(values) as this;
  }
}

// reducer
const initialState: RouterState = new RouterState();

export const router = (
  state: RouterState = initialState,
  action: ActionTypes,
): RouterState => {
  switch (action.type) {
    case UPDATE_ROUTE_ACTION:
      return state.with({
        path: action.path,
        params: action.params,
        route: action.route,
      });
    case RESET_ROUTE_ACTION:
      return initialState;
    default:
      return state;
  }
};
