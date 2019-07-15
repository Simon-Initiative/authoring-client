import { Map, Record } from 'immutable';
import {
  UpdateRouteAction,
  UPDATE_ROUTE_ACTION,
  ResetRouteAction,
  RESET_ROUTE_ACTION,
  SetSearchParamAction,
  SET_SEARCH_PARAM_ACTION,
  ClearSearchParamAction,
  CLEAR_SEARCH_PARAM_ACTION,
} from 'actions/router';
import { OtherAction } from './utils';
import { RouteOption, toRouteLoading } from 'types/router';

export type ActionTypes = UpdateRouteAction
  | ResetRouteAction
  | OtherAction
  | SetSearchParamAction
  | ClearSearchParamAction;

interface RouterStateParams {
  path: string;
  params: Map<string, string>;
  route: RouteOption;
}

const defaults = (params: Partial<RouterStateParams> = {}): RouterStateParams => ({
  path: params.path || '',
  params: params.params || Map<string, string>(),
  route: params.route || toRouteLoading(),
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
      return new RouterState({
        path: action.path,
        params: action.params,
        route: action.route,
      });
    case SET_SEARCH_PARAM_ACTION:
    case CLEAR_SEARCH_PARAM_ACTION:
      return state.with({
        params: action.newUrlParams,
      });
    case RESET_ROUTE_ACTION:
      return initialState;
    default:
      return state;
  }
};
