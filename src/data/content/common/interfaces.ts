
import { HasGuid, Persistable } from 'data/types';


export interface ContentElement extends HasGuid, Persistable {
  clone: () => ContentElement;
  contentType: string;
}

