import * as Immutable from 'immutable';
import {
  COLLAPSE_NODES, collapseNodesAction, EXPAND_NODES, expandNodesAction,
} from '../actions/expand';
import { OtherAction } from './utils';

type ExpandCollapseAction =
  expandNodesAction |
  collapseNodesAction |
  OtherAction;

export type ExpandedState = Immutable.Map<string, Immutable.Set<string>>;

const defaultState = Immutable.Map<string, Immutable.Set<string>>();

export function expanded(
  state: ExpandedState = defaultState,
  action: ExpandCollapseAction,
): ExpandedState {

  switch (action.type) {
    case COLLAPSE_NODES:
      const current = state.get(action.resourceId.value());
      if (current === undefined) {
        return state.set(action.resourceId.value(), Immutable.Set<string>(action.nodeIds));
      }

      return state.set(action.resourceId.value(), current.subtract(action.nodeIds));
    case EXPAND_NODES:
      const curr = state.get(action.resourceId.value());
      if (curr === undefined) {
        return state.set(action.resourceId.value(), Immutable.Set<string>(action.nodeIds));
      }

      return state.set(action.resourceId.value(), curr.union(action.nodeIds));
    default:
      return state;
  }
}
