import * as Immutable from 'immutable';

import { HasGuid, Persistable, Cloneable } from 'data/types';

export interface HasContent<V> {
  content: Immutable.OrderedMap<string, V>;
}

export interface ContentElement<T> extends HasGuid, Persistable, Cloneable<T> {
  contentType: string;
}

export interface ContentType<T, V> extends Persistable, Cloneable<T>, HasContent<V> {
  supportedElements() : string[];
  with(args: HasContent<V>) : ContentType<T, V>;
}
