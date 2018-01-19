import { Map, List, Record } from 'immutable';
import {
  ReceiveMediaPageAction,
  RECEIVE_MEDIA_PAGE,
} from 'actions/media';
import { MediaItem } from 'types/media';
import { OtherAction } from './utils';
import { course } from 'reducers/course';

type OrderedMediaLibraryParams = {};

export class OrderedMediaLibrary extends Record({
  data: Map<string, MediaItem>(),
  items: List<string>(),
}) {
  data: Map<string, MediaItem>;
  items: List<string>;

  with(values: OrderedMediaLibraryParams) {
    return this.merge(values) as OrderedMediaLibrary;
  }

  withMutations(mutator: (record) => OrderedMediaLibrary) {
    return mutator(this);
  }

  getItems(offset: number = 0, count: number = this.items.size) {
    return this.items.map(item => this.data.get(item)).slice(offset, count);
  }
}

export type ActionTypes = ReceiveMediaPageAction;

export type MediaState = Map<string, OrderedMediaLibrary>;

const initialState = Map<string, OrderedMediaLibrary>();

export const media = (
  state: MediaState = initialState,
  action: ActionTypes,
): MediaState => {
  switch (action.type) {
    case RECEIVE_MEDIA_PAGE: {
      const { courseId, items } = action;

      return state.set(
        // key the media library by courseId
        action.courseId,
        // get existing media library or initialize a new one and apply changes
        (state.get(courseId) || new OrderedMediaLibrary()).withMutations(cml =>
          new OrderedMediaLibrary({
            data: cml.data.merge(items.reduce((acc, i) => acc.set(i.guid, i), Map())),
            items: cml.items.concat(items.map(i => i.guid)),
          }),
        ),
      );
    }
    default:
      return state;
  }
};
