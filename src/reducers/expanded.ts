import * as Immutable from 'immutable';
import {
  COLLAPSE_NODES, collapseNodesAction, EXPAND_NODES, expandNodesAction,
} from '../actions/expand';
import { OtherAction } from './utils';

type ExpandCollapseAction =
  expandNodesAction |
  collapseNodesAction |
  OtherAction;

export type ExpandedState = Immutable.Map<string, Immutable.Set<String>>;

const defaultState = Immutable.Map<string, Immutable.Set<String>>();

export function expanded(
  state : ExpandedState = defaultState,
  action: ExpandCollapseAction,
): ExpandedState {

  switch (action.type) {
    case COLLAPSE_NODES:
      const current = state.get(action.resourceId);
      if (current === undefined) {
        return state.set(action.resourceId, Immutable.Set<string>(action.nodeIds));
      }

      return state.set(action.resourceId, current.subtract(action.nodeIds));
    case EXPAND_NODES:
      const curr = state.get(action.resourceId);
      if (curr === undefined) {
        return state.set(action.resourceId, Immutable.Set<string>(action.nodeIds));
      }

      return state.set(action.resourceId, curr.union(action.nodeIds));
    default:
      return state;
  }
}
