import * as Immutable from 'immutable';
import { ContentState, convertFromRaw } from 'draft-js';
import * as common from './common';
import guid from '../../../utils/guid';
import { augment } from '../common';
import { cloneContent } from '../common/clone';
import { toDraft } from './draft/todraft';
import { fromDraft } from './draft/topersistence';

const emptyContent = ContentState.createFromText(' ');

export type ContiguousTextParams = {
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContiguousText',
  content: emptyContent,
  guid: '',
};

export class ContiguousText extends Immutable.Record(defaultContent) {

  contentType: 'ContiguousText';
  content: ContentState;
  guid: string;

  constructor(params?: ContiguousTextParams) {
    super(augment(params));
  }

  with(values: ContiguousTextParams) {
    return this.merge(values) as this;
  }


  clone() : ContiguousText {
    return this.with({
      content: cloneContent(this.content),
    });
  }

  static fromPersistence(root: Object[], guid: string) : ContiguousText {
    return new ContiguousText({ guid, content: toDraft(root) });
  }

  toPersistence() : Object {
    return fromDraft(this.content);
  }
}


