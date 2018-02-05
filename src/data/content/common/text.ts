import * as Immutable from 'immutable';

import guid from 'utils/guid';
import { augment } from '../common';
import { ContiguousText } from '../learning/contiguous';
import { parseContent } from './parse';
import { ContentType, ContentElement } from './interfaces';



export type TextElementType = 'ContiguousText';

export interface TextElement extends ContentElement<TextElementType> {

}






export const SUPPORTED_ELEMENTS = ['#text', 'em', 'sub', 'sup', 'ipa', 'foreign',
  'cite', 'term', 'var', 'link', 'activity_link', 'xref', 'input_ref'];

export function parseTextContent(obj: Object)
  : ContiguousText {

  const result = parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, TextElement>;

  return result;
}

export type TextContentParams = {
  content?: Immutable.OrderedMap<string, TextElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'TextContent',
  content: Immutable.OrderedMap<string, TextElement>(),
  guid: '',
};

export class TextContent extends Immutable.Record(defaultContent)
  implements ContentType<TextElement> {

  contentType: 'TextContent';
  content: Immutable.OrderedMap<string, TextElement>;
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
      content: this.content.map(c => c.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, g: string) : TextContent {
    const text = parseTextContent(root).with({ guid: guid() });
    return new TextContent({ guid: g, content:
      Immutable.OrderedMap<string, TextElement>([[text.guid, text]]) });
  }


  static fromText(text: string, guid: string) : TextContent {
    const content = ContiguousText.fromText(text, '');
    return new TextContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.first().toPersistence();
  }
}


