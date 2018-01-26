import { HasGuid, Persistable, Cloneable } from 'data/types';

export interface ContentElement<T> extends HasGuid, Persistable, Cloneable<T> {

}

export interface ContentType<T> extends Persistable, Cloneable<T> {
  supportedElements() : string[];
}
