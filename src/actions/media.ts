import { List } from 'immutable';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { FileNode } from 'data/content/file_node';
import * as persistence from 'data/persistence';
import { Maybe } from 'tsmonad';
import { MediaItem } from 'types/media';
import * as messageActions from 'actions/messages';
import * as Messages from 'types/messages';

const MEDIA_PAGE_SIZE = 40;

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

export const ReceiveMediaPageAction = (
  courseId: string, items: List<MediaItem>, totalItems: number): ReceiveMediaPageAction => ({
    type: RECEIVE_MEDIA_PAGE,
    courseId,
    items,
    totalItems,
  });

export const fetchCourseMedia = (
    courseId: string, offset?: number, limit?: number, mimeFilter?: string,
    pathFilter?: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<List<MediaItem>>> => {
    dispatch(fetchMediaPage(courseId));

    return persistence.fetchWebContent(courseId, offset, limit, mimeFilter, pathFilter)
      .then((response) => {
        const items = List<MediaItem>(
          response.results.map(item => new FileNode(item.fileNode)));

        dispatch(ReceiveMediaPageAction(courseId, items, response.totalResults));

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
    courseId: string, mimeFilter?: string, pathFilter?: string) => (
  (dispatch: Dispatch<State>, getState: () => State): Promise<Maybe<List<MediaItem>>> => {
    const limit = MEDIA_PAGE_SIZE;
    const offset = getState().media.get(courseId)
      ? getState().media.get(courseId).items.size
      : 0;
    return dispatch(fetchCourseMedia(courseId, offset, limit, mimeFilter, pathFilter));
  }
);
