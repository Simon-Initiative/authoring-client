import { List, Map } from 'immutable';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { Maybe } from 'tsmonad';
import { EditedDocument } from 'types/document';

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


