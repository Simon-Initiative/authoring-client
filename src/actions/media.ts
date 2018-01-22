import { List, Map } from 'immutable';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { FileNode } from 'data/content/file_node';
import * as persistence from 'data/persistence';
import { Maybe } from 'tsmonad';
import { MediaItem } from 'types/media';

const MEDIA_PAGE_SIZE = 50;

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

export type CLEAR_MEDIA = 'media/CLEAR_MEDIA';
export const CLEAR_MEDIA: CLEAR_MEDIA = 'media/CLEAR_MEDIA';

export type ClearMediaAction = {
  type: CLEAR_MEDIA,
  courseId: string,
};

export const clearMedia = (courseId: string): ClearMediaAction => ({
  type: CLEAR_MEDIA,
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

export const ReceiveMediaPageAction = (
  courseId: string, items: List<MediaItem>, totalItems: number): ReceiveMediaPageAction => ({
    type: RECEIVE_MEDIA_PAGE,
    courseId,
    items,
    totalItems,
  });

export const fetchCourseMedia = (
    courseId: string, offset?: number, limit?: number, mimeFilter?: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<List<MediaItem>>> => {
    dispatch(fetchMediaPage(courseId));

    return persistence.fetchWebContent(courseId, offset, limit, mimeFilter)
      .then((response) => {
        const items = List<MediaItem>(
          response.results.map(item => new FileNode(item.fileNode)));

        dispatch(ReceiveMediaPageAction(courseId, items, response.totalResults));

        return Maybe.just(items);
      })
      .catch((err) => {
        // TODO: do some better error handling than this
        console.error('Failed to fetch course media', err);

        return Maybe.nothing();
      });
  }
);

export const fetchCourseMediaNextPage = (courseId: string, mimeFilter?: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<List<MediaItem>>> => {
    const limit = MEDIA_PAGE_SIZE;
    const offset = getState().media.get(courseId)
      ? getState().media.get(courseId).items.size
      : 0;
    return dispatch(fetchCourseMedia(courseId, offset, limit, mimeFilter));
  }
);
