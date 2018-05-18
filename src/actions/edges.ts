import { List, Map, OrderedMap } from 'immutable';
import { State } from 'reducers';
import { Dispatch } from 'react-redux';
import * as persistence from 'data/persistence';
import { Maybe } from 'tsmonad/lib/src';
import { Edge } from 'types/edge';
import { Resource } from 'data/contentTypes';

export type LOAD_RESOURCE_EDGES = 'Edges/LOAD_RESOURCE_EDGES';
export const LOAD_RESOURCE_EDGES: LOAD_RESOURCE_EDGES = 'Edges/LOAD_RESOURCE_EDGES';

export type LoadResourceEdgesAction = {
  type: LOAD_RESOURCE_EDGES,
  resource: Resource,
  edges: Maybe<OrderedMap<string, Edge>>,
};

// do we even need this?
export const loadResourceEdges = (resource: Resource, edges: Maybe<OrderedMap<string, Edge>>):
  LoadResourceEdgesAction => ({
    type: LOAD_RESOURCE_EDGES,
    resource,
    edges,
  });

export const fetchResourceEdges = (resource: Resource) =>
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<OrderedMap<string, Edge>>> => {
    return persistence.fetchResourceReferences(resource.id, { destinationType: resource.type })
      .then((edges) => {
        const webcontentPathToSourceMap = edges.reduce(
          (acc, edge) => {
            // what is the edge path to?
            const edgePathTo = edge.destinationId.replace(/^.*content\//, 'webcontent/');
            return acc.set(
              edgePathTo,
              (acc.get(edgePathTo) || new Edge()).concat({
                resourceId: edge.sourceId.replace(/^.*:/, ''),
                guid: edge.metadata.jsonObject.sourceGuid,
              }) as Edge,
            );
          },
          OrderedMap<string, Edge>());

        const references = getState().Resource.get(courseId).data.toArray()
          .reduce(
            (acc, i) => (
              acc.set(i.guid, webcontentPathToSourceMap.get(i.pathTo) || List<miniResourceRef>())
            ),
            Map<string, List<miniResourceRef>>());

        // do we need this?
        dispatch(loadResourceEdges(resource, references));

        return references;
      });
  };
