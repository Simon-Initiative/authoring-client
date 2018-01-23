import * as Immutable from 'immutable';
import { MediaItem } from 'types/media';

type OrderedMediaLibraryParams = {
  items?: Immutable.OrderedMap<string, MediaItem>;
  totalItems?: number;
  totalItemsLoaded?: number;
  isLoading?: boolean;
};

const defaultContent = {
  items: Immutable.OrderedMap<string, MediaItem>(),
  totalItems: -Infinity,
  totalItemsLoaded: 0,
  isLoading: false,
};

export class OrderedMediaLibrary extends Immutable.Record(defaultContent) {
  items: Immutable.OrderedMap<string, MediaItem>;
  totalItems: number;
  totalItemsLoaded: number;
  isLoading: boolean;

  constructor(params?: OrderedMediaLibraryParams) {
    super(params);
  }

  with(values: OrderedMediaLibraryParams) {
    return this.merge(values) as this;
  }

  getItem(guid: string) {
    return this.items.get(guid);
  }

  getItems(offset: number = 0, count: number = this.items.size) {
    return this.items.slice(offset, count).toArray();
  }

  allItemsLoaded() {
    return this.totalItems > -Infinity && this.totalItemsLoaded >= this.totalItems;
  }
}
