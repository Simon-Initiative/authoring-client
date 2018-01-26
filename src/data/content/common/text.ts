import * as Immutable from 'immutable';

import guid from 'utils/guid';
import { augment } from '../common';
import { ContiguousText } from '../learning/contiguous';
import { parseContent } from './parse';
import { ContentType } from './interfaces';

export const SUPPORTED_ELEMENTS = ['#text', 'em', 'sub', 'sup', 'ipa', 'foreign',
  'cite', 'term', 'var', 'link', 'activity_link', 'xref', 'input_ref'];

export function parseTextContent(obj: Object)
  : ContiguousText {

  const result = parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, ContiguousText>;

  return result.first();
}

export type TextContentParams = {
  content?: ContiguousText,
  guid?: string,
};

const defaultContent = {
  contentType: 'TextContent',
  content: new ContiguousText(),
  guid: '',
};

export class TextContent extends Immutable.Record(defaultContent)
  implements ContentType<TextContent> {

  contentType: 'TextContent';
  content: ContiguousText;
  guid: string;

  constructor(params?: TextContentParams) {
    super(augment(params));
  }

  supportedElements() {
    return SUPPORTED_ELEMENTS;
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


