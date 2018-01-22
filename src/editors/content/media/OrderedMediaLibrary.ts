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
    // TODO: This doesn't work... not sure why
    // return this.merge(values);

    // this is really ugly, but currently the only way to get this working...

    // tslint:disable-next-line:no-var-self
    let updatedRecord: OrderedMediaLibrary = this;
    updatedRecord = updatedRecord.set('data', values.data !== undefined
      ? values.data : this.data) as OrderedMediaLibrary;
    updatedRecord = updatedRecord.set('items', values.data !== undefined
      ? values.items : this.items) as OrderedMediaLibrary;
    updatedRecord = updatedRecord.set('totalItems', values.data !== undefined
      ? values.totalItems : this.totalItems) as OrderedMediaLibrary;
    updatedRecord = updatedRecord.set('isLoading', values.data !== undefined
      ? values.isLoading : this.isLoading) as OrderedMediaLibrary;

    return updatedRecord;
  }

  withMutations(mutator: (record: OrderedMediaLibrary) => OrderedMediaLibrary) {
    return mutator(this);
  }

  getItems(offset: number = 0, count: number = this.items.size) {
    return this.items.map(item => this.data.get(item)).slice(offset, count).toArray();
  }
}
