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
import { fromCourseIdentifier } from 'data/utils/idwrappers';

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
      const { courseId, reqId } = action;
      const id = fromCourseIdentifier(courseId);

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(id) || new OrderedMediaLibrary();

      return state.set(
        id,
        mediaLibrary.with({
          isLoading: true,
          lastReqId: reqId,
        }),
      );
    }
    case RESET_MEDIA: {
      const { courseId } = action;
      const id = fromCourseIdentifier(courseId);

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(id) || new OrderedMediaLibrary();

      return state.set(
        id,
        mediaLibrary.clearItems(),
      );
    }
    case RECEIVE_MEDIA_PAGE: {
      const { courseId, items, totalItems } = action;
      const id = fromCourseIdentifier(courseId);

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(id) || new OrderedMediaLibrary();

      return state.set(
        id,
        mediaLibrary.load(items, totalItems).with({
          isLoading: false,
        }),
      );
    }
    case SIDELOAD_DATA: {
      const { courseId, data } = action;
      const id = fromCourseIdentifier(courseId);

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(id) || new OrderedMediaLibrary();

      return state.set(
        id,
        mediaLibrary.sideloadData(data),
      );
    }
    case LOAD_MEDIA_REFS: {
      const { courseId, references } = action;
      const id = fromCourseIdentifier(courseId);

      // get existing media library or initialize a new one
      const mediaLibrary = state.get(id) || new OrderedMediaLibrary();

      return state.set(
        id,
        mediaLibrary.loadReferences(references),
      );
    }
    default:
      return state;
  }
};
