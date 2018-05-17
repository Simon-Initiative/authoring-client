import { List, Map } from 'immutable';
import { miniResourceRef } from 'components/DeleteResourceView.controller';
import { State } from 'reducers';
import { Dispatch } from 'react-redux';
import * as persistence from 'data/persistence';
import { LegacyTypes } from 'data/types';

// deleteResources
// () => onDisplayModal(
// <DeleteResourceView
//   resource={documentResource}
//   onCancel={onDismissModal}
//   onDelete={() => {}}
// />

export type LOAD_RESOURCE_REFS = 'Resource/LOAD_RESOURCE_REFS';
export const LOAD_RESOURCE_REFS: LOAD_RESOURCE_REFS = 'Resource/LOAD_RESOURCE_REFS';

export type LoadResourceReferencesAction = {
  type: LOAD_RESOURCE_REFS,
  courseId: string,
  references: Map<string, List<miniResourceRef>>,
};

export const loadResourceReferences = (
  courseId: string, references: Map<string, List<miniResourceRef>>):
  LoadResourceReferencesAction => ({
    type: LOAD_RESOURCE_REFS,
    courseId,
    references,
  });

export const fetchResourceReferences = (courseId: string) => (
  (dispatch: Dispatch<State>, getState: () => State):
  Promise<Map<string, List<miniResourceRef>>> => {
    return persistence.fetchWebContentReferences(courseId, {
      destinationType: LegacyTypes.webcontent,
    })
      .then((edges) => {
        const webcontentPathToSourceMap = edges.reduce(
          (acc, edge) => {
            const edgePathTo = edge.destinationId.replace(/^.*content\//, 'webcontent/');
            return acc.set(
              edgePathTo,
              (acc.get(edgePathTo) || List<miniResourceRef>()).concat({
                resourceId: edge.sourceId.replace(/^.*:/, ''),
                guid: edge.metadata.jsonObject.sourceGuid,
              }) as List<miniResourceRef>,
            );
          },
          Map<string, List<miniResourceRef>>());

        const references = getState().Resource.get(courseId).data.toArray()
          .reduce(
            (acc, i) => (
              acc.set(i.guid, webcontentPathToSourceMap.get(i.pathTo) || List<miniResourceRef>())
            ),
            Map<string, List<miniResourceRef>>());

        dispatch(loadResourceReferences(courseId, references));

        return references;
      });
  }
);
