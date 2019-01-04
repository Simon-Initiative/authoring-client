import { Map, Record } from 'immutable';
import { Maybe } from 'tsmonad';
import {
  ROUTE,
  UpdateRouteAction,
  UPDATE_ROUTE_ACTION,
  ResetRouteAction,
  RESET_ROUTE_ACTION,
} from 'actions/router';
import { OtherAction } from './utils';

export type ActionTypes = UpdateRouteAction | ResetRouteAction | OtherAction;

// model
interface RouterStateParams {
  route: ROUTE;
  path: string;
  courseId: Maybe<string>;
  resourceId: Maybe<string>;
  urlParams: Map<string, string>;
}

const defaults = (params: Partial<RouterStateParams> = {}): RouterStateParams => ({
  route: params.route || ROUTE.ROOT,
  path: params.path || '',
  courseId: params.courseId || Maybe.nothing(),
  resourceId: params.resourceId || Maybe.nothing(),
  urlParams: params.urlParams || Map<string, string>(),
});

export class RouterState extends Record(defaults()) implements RouterStateParams {
  route: ROUTE;
  path: string;
  courseId: Maybe<string>;
  resourceId: Maybe<string>;
  urlParams: Map<string, string>;

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
        route: action.route,
        path: action.path,
        courseId: action.courseId,
        resourceId: action.resourceId,
        urlParams: action.urlParams || Map<string, string>(),
      });
    case RESET_ROUTE_ACTION:
      return initialState;
    default:
      return state;
  }
};
