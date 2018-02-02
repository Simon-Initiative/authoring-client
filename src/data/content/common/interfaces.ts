import * as Immutable from 'immutable';

import { HasGuid, Persistable, Cloneable } from 'data/types';

export interface HasContent<V> {
  content: Immutable.OrderedMap<string, V>;
}

export interface ContentElement<T> extends HasGuid, Persistable {
  clone: () => ContentElement<T>;
  contentType: T;
}

export interface ContentType<V>
  extends Persistable, HasContent<V> {
  supportedElements() : string[];
  with(args: HasContent<V>) : ContentType<V>;
  clone: () => ContentType<V>;
}
