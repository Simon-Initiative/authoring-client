import { List, Map } from 'immutable';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { FileNode } from 'data/content/file_node';
import * as persistence from 'data/persistence';
import { Maybe } from 'tsmonad';
import { MediaItem } from 'types/media';
import * as messageActions from 'actions/messages';
import * as Messages from 'types/messages';

const MEDIA_PAGE_SIZE = 60;

export type FETCH_MEDIA_PAGE = 'media/FETCH_MEDIA_PAGE';
export const FETCH_MEDIA_PAGE: FETCH_MEDIA_PAGE = 'media/FETCH_MEDIA_PAGE';

export type FetchMediaPageAction = {
  type: FETCH_MEDIA_PAGE,
  courseId: string,
};

export const fetchMediaPage = (courseId: string): FetchMediaPageAction => ({
  type: FETCH_MEDIA_PAGE,
  courseId,
});

export type RESET_MEDIA = 'media/RESET_MEDIA';
export const RESET_MEDIA: RESET_MEDIA = 'media/RESET_MEDIA';

export type ResetMediaAction = {
  type: RESET_MEDIA,
  courseId: string,
};

export const resetMedia = (courseId: string): ResetMediaAction => ({
  type: RESET_MEDIA,
  courseId,
});

export type RECEIVE_MEDIA_PAGE = 'media/RECEIVE_MEDIA_PAGE';
export const RECEIVE_MEDIA_PAGE: RECEIVE_MEDIA_PAGE = 'media/RECEIVE_MEDIA_PAGE';

export type ReceiveMediaPageAction = {
  type: RECEIVE_MEDIA_PAGE,
  courseId: string,
  items: List<MediaItem>,
  totalItems: number,
};

export const receiveMediaPage = (
  courseId: string, items: List<MediaItem>, totalItems: number): ReceiveMediaPageAction => ({
    type: RECEIVE_MEDIA_PAGE,
    courseId,
    items,
    totalItems,
  });

export type SIDELOAD_DATA = 'media/SIDELOAD_DATA';
export const SIDELOAD_DATA: SIDELOAD_DATA = 'media/SIDELOAD_DATA';

export type SideloadDataAction = {
  type: SIDELOAD_DATA,
  courseId: string,
  data: Map<string, MediaItem>,
};

export const sideloadData = (
  courseId: string, data: Map<string, MediaItem>): SideloadDataAction => ({
    type: SIDELOAD_DATA,
    courseId,
    data,
  });

export type LOAD_MEDIA_REFS = 'media/LOAD_MEDIA_REFS';
export const LOAD_MEDIA_REFS: LOAD_MEDIA_REFS = 'media/LOAD_MEDIA_REFS';

export type LoadMediaReferencesAction = {
  type: LOAD_MEDIA_REFS,
  courseId: string,
  references: Map<string, number>,
};

export const loadMediaReferences = (
  courseId: string, references: Map<string, number>): LoadMediaReferencesAction => ({
    type: LOAD_MEDIA_REFS,
    courseId,
    references,
  });

export const fetchMediaReferences = (courseId: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Map<string, number>> => {
    return persistence.fetchWebContentReferences(courseId, {
      destinationType: 'x-oli-webcontent',
    })
    .then((edges) => {
      const webcontentPathToCountMap = edges.reduce(
        (acc, edge) => {
          const edgePathTo = edge.destinationId.replace(/^.*content\//, 'webcontent/');
          return acc.set(edgePathTo, (acc.get(edgePathTo) || 0) + 1);
        },
        Map<string, number>());

      const references = getState().media.get(courseId).getItems()
        .reduce(
          (acc, i) => (
            acc.set(i.guid, webcontentPathToCountMap.get(i.pathTo) || 0)
          ),
          Map<string, number>());

      dispatch(loadMediaReferences(courseId, references));

      return references;
    });
  }
);

export const fetchCourseMedia = (
    courseId: string, offset?: number, limit?: number, mimeFilter?: string,
    searchText?: string, orderBy?: string, order?: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<List<MediaItem>>> => {
    dispatch(fetchMediaPage(courseId));

    return persistence.fetchWebContent(
        courseId, offset, limit, mimeFilter, null, searchText, orderBy, order)
      .then((response) => {
        const items = List<MediaItem>(
          response.results.map(item => new FileNode(item.fileNode)));

        dispatch(receiveMediaPage(courseId, items, response.totalResults));
        dispatch(fetchMediaReferences(courseId));

        return Maybe.just(items);
      })
      .catch((err) => {
        const content = new Messages.TitledContent().with({
          title: 'Failed to load media',
          message: 'There was a problem loading media for this course. '
            + 'Please check your internet connection and try again.',
        });

        const failedMessage = new Messages.Message().with({
          content,
          scope: Messages.Scope.Resource,
          severity: Messages.Severity.Error,
          canUserDismiss: true,
        });

        dispatch(messageActions.showMessage(failedMessage));

        return Maybe.nothing();
      });
  }
);

export const fetchCourseMediaNextPage = (
    courseId: string, mimeFilter?: string, searchText?: string,
    orderBy?: string, order?: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<List<MediaItem>>> => {
    const limit = MEDIA_PAGE_SIZE;
    const offset = getState().media.get(courseId)
      ? getState().media.get(courseId).items.size
      : 0;
    return dispatch(fetchCourseMedia(
      courseId, offset, limit, mimeFilter, searchText, orderBy, order));
  }
);

export const fetchMediaItemByPath = (courseId: string, path: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<MediaItem>> => {
    const limit = 1;
    const offset = 0;

    return persistence.fetchWebContent(courseId, offset, limit, null, path)
    .then((response) => {
      const data = Map<string, MediaItem>(
        response.results.map(item => [item.fileNode.guid, new FileNode(item.fileNode)]));

      dispatch(sideloadData(courseId, data));

      return Maybe.maybe(data.first());
    });
  }
);
