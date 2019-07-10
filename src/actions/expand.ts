import { ResourceId } from 'data/types';

export type EXPAND_NODES = 'EXPAND_NODES';
export const EXPAND_NODES = 'EXPAND_NODES';

export type COLLAPSE_NODES = 'COLLAPSE_NODES';
export const COLLAPSE_NODES = 'COLLAPSE_NODES';

export type expandNodesAction = {
  type: EXPAND_NODES,
  resourceId: ResourceId,
  nodeIds: string[],
};

export function expandNodes(resourceId: ResourceId, nodeIds: string[]): expandNodesAction {
  return {
    type: EXPAND_NODES,
    resourceId,
    nodeIds,
  };
}

export type collapseNodesAction = {
  type: COLLAPSE_NODES,
  resourceId: ResourceId,
  nodeIds: string[],
};

export function collapseNodes(resourceId: ResourceId, nodeIds: string[]): collapseNodesAction {
  return {
    type: COLLAPSE_NODES,
    resourceId,
    nodeIds,
  };
}

