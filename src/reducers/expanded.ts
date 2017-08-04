
import * as Immutable from 'immutable';
import { expandNodesAction, collapseNodesAction, 
  COLLAPSE_NODES, EXPAND_NODES } from '../actions/expand';
import { OtherAction } from './utils';

type ExpandCollapseAction = 
  expandNodesAction |
  collapseNodesAction |
  OtherAction;

const defaultState = Immutable.Map<string, Immutable.Set<String>>();

export function expanded(
  state : Immutable.Map<string, Immutable.Set<String>> = defaultState, 
  action: ExpandCollapseAction) {
  
  switch (action.type) {
    case COLLAPSE_NODES:
      const current = state.get(action.resourceId);
      if (current === undefined) {
        return state.set(action.resourceId, Immutable.Set<string>(action.nodeIds));
      } else {
        return state.set(action.resourceId, current.subtract(action.nodeIds));
      }
      
    case EXPAND_NODES:
      const curr = state.get(action.resourceId);
      if (curr === undefined) {
        return state.set(action.resourceId, Immutable.Set<string>(action.nodeIds));
      } else {
        return state.set(action.resourceId, curr.union(action.nodeIds));
      }
    default:
      return state;
  }
}
