import * as Immutable from 'immutable';

import * as common from '../html/common';
import guid from 'utils/guid';
import { augment } from '../common';
import { ContiguousText } from '../html/contiguous';
import { parseTextContent } from './parser';

export type TextContentParams = {
  content?: ContiguousText,
  guid?: string,
};

const defaultContent = {
  contentType: 'TextContent',
  content: new ContiguousText(),
  guid: '',
};

export class TextContent extends Immutable.Record(defaultContent) {

  contentType: 'TextContent';
  content: ContiguousText;
  guid: string;

  constructor(params?: TextContentParams) {
    super(augment(params));
  }

  with(values: TextContentParams) {
    return this.merge(values) as this;
  }


  clone() : TextContent {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : TextContent {
    return new TextContent({ guid, content: parseTextContent(root) });
  }

  toPersistence() : Object {
    return this.content.toPersistence();
  }
}


