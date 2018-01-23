import * as Immutable from 'immutable';
import { ContentState, convertFromRaw } from 'draft-js';
import * as common from './common';
import { Image } from './image';
import { Link as HyperLink } from './link';
import { Xref } from './xref';
import { ActivityLink } from './activity_link';
import { Cite } from './cite';
import guid from '../../../utils/guid';
import { augment } from '../common';
import { cloneContent } from '../common/clone';
import { toDraft } from './todraft';
import { fromDraft } from './topersistence';

const emptyContent = ContentState.createFromText(' ');

export type TextParams = {
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'Text',
  content: emptyContent,
  guid: '',
};

export class Text extends Immutable.Record(defaultContent) {

  contentType: 'Text';
  content: ContentState;
  guid: string;

  constructor(params?: TextParams) {
    super(augment(params));
  }

  with(values: TextParams) {
    return this.merge(values) as this;
  }


  clone() : Text {
    return this.with({
      content: cloneContent(this.content),
    });
  }

  static fromPersistence(root: Object, guid: string) : Text {
    return new Text({ guid, content: toDraft(root) });
  }

  toPersistence() : Object {
    return fromDraft(this.content);
  }
}


