import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { InlineElementType, SUPPORTED_ELEMENTS as INLINE_ELEMENTS } from './inline';
import { parseContent } from './parse';
import { augment, getChildren } from '../common';
import { ContentType, ContentElement } from './interfaces';
import { ContiguousText } from 'data/content/learning/contiguous';
import createGuid from 'utils/guid';

export type FlowElementType = InlineElementType;

export interface FlowElement extends ContentElement<FlowElementType> {

}

export const SUPPORTED_ELEMENTS = [...INLINE_ELEMENTS];

export function parseFlowContent(obj: Object)
  : Immutable.OrderedMap<string, FlowElement> {

  return parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, FlowElement>;
}


export type FlowContentParams = {
  content?: Immutable.OrderedMap<string, FlowElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'FlowContent',
  content: Immutable.OrderedMap<string, FlowElement>(),
  guid: '',
};

export class FlowContent extends Immutable.Record(defaultContent)
  implements ContentType<FlowElement> {

  contentType: 'FlowContent';
  content: Immutable.OrderedMap<string, FlowElement>;
  guid: string;

  constructor(params?: FlowContentParams) {
    super(augment(params));
  }

  with(values: FlowContentParams) {
    return this.merge(values) as this;
  }

  clone(): FlowContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  supportedElements() {
    return SUPPORTED_ELEMENTS;
  }

  extractPlainText() : Maybe<string> {
    const t = this.content.toArray().filter(c => c.contentType === 'ContiguousText');
    if (t.length > 0) {
      return (t[0] as ContiguousText).extractPlainText();
    }
    return Maybe.nothing();
  }

  static fromPersistence(root: Object, guid: string) : FlowContent {

    const content = parseFlowContent(root);
    return new FlowContent({ guid, content });
  }

  static fromText(text: string, guid: string) : FlowContent {
    const t = ContiguousText.fromText(text, createGuid());
    return new FlowContent({ guid,
      content: Immutable.OrderedMap<string, FlowElement>().set(t.guid, t) });
  }


  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
