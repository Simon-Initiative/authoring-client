import * as Immutable from 'immutable';
import { MediaItem } from 'types/media';

type OrderedMediaLibraryParams = {
  data?: Immutable.Map<string, MediaItem>;
  items?: Immutable.List<string>;
  totalItems?: number;
  isLoading?: boolean;
};

const defaultContent = {
  data: Immutable.Map<string, MediaItem>(),
  items: Immutable.List<string>(),
  totalItems: -Infinity,
  isLoading: false,
};

export class OrderedMediaLibrary extends Immutable.Record(defaultContent) {
  data: Immutable.Map<string, MediaItem>;
  items: Immutable.List<string>;
  totalItems: number;
  isLoading: boolean;

  constructor(params?: OrderedMediaLibraryParams) {
    super(params);
  }

  with(values: OrderedMediaLibraryParams) {
    return this.merge(values) as this;
  }

  getItems(offset: number = 0, count: number = this.items.size) {
    return this.items.map(item => this.data.get(item)).slice(offset, count).toArray();
  }
}
