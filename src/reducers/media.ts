import { Map } from 'immutable';
import {
  FETCH_MEDIA_PAGE,
  FetchMediaPageAction,
  RESET_MEDIA,
  ResetMediaAction,
  RECEIVE_MEDIA_PAGE,
  ReceiveMediaPageAction,
  SIDELOAD_DATA,
  SideloadDataAction,
  LOAD_MEDIA_REFS,
  LoadMediaReferencesAction,
} from 'actions/media';
import { OrderedMediaLibrary } from 'editors/content/media/OrderedMediaLibrary';

export type ActionTypes = FetchMediaPageAction | ResetMediaAction | ReceiveMediaPageAction
  | SideloadDataAction | LoadMediaReferencesAction;

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
        mediaLibrary.load(items, totalItems).with({
          isLoading: false,
        }),
      );
    }
    case SIDELOAD_DATA: {
      const { courseId, data } = action;

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(courseId) || new OrderedMediaLibrary();

      return state.set(
        courseId,
        mediaLibrary.sideloadData(data),
      );
    }
    case LOAD_MEDIA_REFS: {
      const { courseId, references } = action;

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(courseId) || new OrderedMediaLibrary();

      return state.set(
        courseId,
        mediaLibrary.loadReferences(references),
      );
    }
    default:
      return state;
  }
};
