import { List, Map } from 'immutable';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { FileNode } from 'data/content/file_node';
import * as persistence from 'data/persistence';
import { Maybe } from 'tsmonad';
import { MediaItem } from 'types/media';

const MEDIA_PAGE_SIZE = 20;

export type RECEIVE_MEDIA_PAGE = 'media/RECEIVE_MEDIA_PAGE';
export const RECEIVE_MEDIA_PAGE: RECEIVE_MEDIA_PAGE = 'media/RECEIVE_MEDIA_PAGE';

export type ReceiveMediaPageAction = {
  type: RECEIVE_MEDIA_PAGE,
  courseId: string,
  items: List<MediaItem>,
};

export const ReceiveMediaPageAction = (
  courseId: string, items: List<MediaItem>): ReceiveMediaPageAction => ({
    type: RECEIVE_MEDIA_PAGE,
    courseId,
    items,
  });

export const fetchCourseMedia = (courseId: string, offset?: number, count?: number) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<List<MediaItem>>> => {
    return persistence.fetchWebContent(courseId, offset, count)
      .then((response) => {
        const items = List<MediaItem>(
          response.results.map(item => new FileNode(item.fileNode)));

        dispatch(ReceiveMediaPageAction(courseId, items));

        return Maybe.just(items);
      })
      .catch((err) => {
        // TODO: do some better error handling than this
        console.error('Failed to fetch course media', err);

        return Maybe.nothing();
      });
  }
);

export const fetchCourseMediaNextPage = (courseId: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<List<MediaItem>>> => {
    const count = MEDIA_PAGE_SIZE;
    const offset = getState().media.get(courseId).items.size;
    return dispatch(fetchCourseMedia(courseId, offset, count));
  }
);
