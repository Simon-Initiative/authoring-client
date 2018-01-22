import { Map, List, Record, OrderedMap } from 'immutable';
import {
  FETCH_MEDIA_PAGE,
  FetchMediaPageAction,
  RESET_MEDIA,
  ResetMediaAction,
  RECEIVE_MEDIA_PAGE,
  ReceiveMediaPageAction,
} from 'actions/media';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';
import { MediaItem } from 'types/media';
import { OtherAction } from './utils';
import { course } from 'reducers/course';

export type ActionTypes = FetchMediaPageAction | ResetMediaAction | ReceiveMediaPageAction;

export type MediaState = Map<string, OrderedMediaLibrary>;

const initialState = Map<string, OrderedMediaLibrary>();

export const media = (
  state: MediaState = initialState,
  action: ActionTypes,
): MediaState => {
  switch (action.type) {
    case FETCH_MEDIA_PAGE: {
      const { courseId } = action;

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(courseId) || new OrderedMediaLibrary();

      return state.set(
        courseId,
        mediaLibrary.with({
          isLoading: true,
        }),
      );
    }
    case RESET_MEDIA: {
      const { courseId } = action;

      return state.set(
        courseId,
        new OrderedMediaLibrary(),
      );
    }
    case RECEIVE_MEDIA_PAGE: {
      const { courseId, items, totalItems } = action;

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(courseId) || new OrderedMediaLibrary();

      return state.set(
        courseId,
        mediaLibrary.with({
          items: mediaLibrary.items
            .merge(items.reduce((acc, i) => acc.set(i.guid, i), OrderedMap())),
          totalItems,
          totalItemsLoaded: mediaLibrary.totalItemsLoaded + items.size,
          isLoading: false,
        }),
      );
    }
    default:
      return state;
  }
};
