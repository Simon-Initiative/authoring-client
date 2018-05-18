import { Record } from 'immutable';
import { HasGuid, Persistable } from 'data/types';


export interface ContentElement extends HasGuid, Persistable, Record<any, any> {
  clone: () => ContentElement;
  contentType: string;
  elementType: string;
}

