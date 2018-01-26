import * as Immutable from 'immutable';
import { InlineElementType, SUPPORTED_ELEMENTS as INLINE_ELEMENTS } from './inline';
import { parseContent } from './parse';
import { augment, getChildren } from '../common';
import { ContentType, ContentElement } from './interfaces';

export type FlowElementType = InlineElementType;

export interface FlowElement extends ContentElement<FlowElement> {
  contentType: FlowElementType;
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
  implements ContentType<FlowContent> {

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

  static fromPersistence(root: Object, guid: string) : FlowContent {

    const content = parseFlowContent(root);
    return new FlowContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
