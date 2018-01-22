import { Map, List, Record } from 'immutable';
// import * as Immutable from 'immutable';
import {
  FETCH_MEDIA_PAGE,
  FetchMediaPageAction,
  RECEIVE_MEDIA_PAGE,
  ReceiveMediaPageAction,
} from 'actions/media';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';
import { MediaItem } from 'types/media';
import { OtherAction } from './utils';
import { course } from 'reducers/course';

export type ActionTypes = FetchMediaPageAction | ReceiveMediaPageAction;

export type MediaState = Map<string, OrderedMediaLibrary>;

const initialState = Map<string, OrderedMediaLibrary>();

export const media = (
  state: MediaState = initialState,
  action: ActionTypes,
): MediaState => {
  switch (action.type) {
    case FETCH_MEDIA_PAGE: {
      const { courseId } = action;

      const mediaLibrary = state.get(courseId) || new OrderedMediaLibrary();

      return state.set(
        // key the media library by courseId
        courseId,
        // get existing media library or initialize a new one and apply changes
        mediaLibrary.set('isLoading', true) as OrderedMediaLibrary,
      );
    }
    case RECEIVE_MEDIA_PAGE: {
      const { courseId, items, totalItems } = action;

      const mediaLibrary = state.get(courseId) || new OrderedMediaLibrary();

      return state.set(
        // key the media library by courseId
        courseId,
        // get existing media library or initialize a new one and apply changes
        mediaLibrary.with({
          data: mediaLibrary.data.merge(items.reduce((acc, i) => acc.set(i.guid, i), Map())),
          items: List<string>(mediaLibrary.items.toArray().concat(
            items.toArray().map(i => i.guid))),
          totalItems,
          isLoading: false,
        }) as OrderedMediaLibrary,
      );
    }
    default:
      return state;
  }
};
