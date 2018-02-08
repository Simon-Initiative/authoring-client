import * as Immutable from 'immutable';

import { HasGuid, Persistable, Cloneable } from 'data/types';


export interface ContentElement extends HasGuid, Persistable {
  clone: () => ContentElement;
  contentType: string;
}

