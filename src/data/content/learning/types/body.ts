import * as Immutable from 'immutable';
import { InlineElementType, SUPPORTED_ELEMENTS as INLINE_ELEMENTS } from './inline';
import { parseContent } from '../../common/parse';
import { augment, getChildren } from '../../common';
import { ContentType, ContentElement } from '../../common/interfaces';

export type BodyElementType = InlineElementType |
  'Definition' | 'Example' | 'Pullout';


const SEMANTIC_ELEMENTS = ['popout', 'example', 'definition'];

export const SUPPORTED_ELEMENTS = [...SEMANTIC_ELEMENTS, ...INLINE_ELEMENTS];

function parseBodyContent(obj: Object)
  : Immutable.OrderedMap<string, BodyElement> {

  return parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, BodyElement>;
}


export interface BodyElement extends ContentElement<BodyElement> {
  contentType: BodyElementType;
}


export type BodyContentParams = {
  content?: Immutable.OrderedMap<string, BodyElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'BodyContent',
  content: Immutable.OrderedMap<string, BodyElement>(),
  guid: '',
};

export class BodyContent extends Immutable.Record(defaultContent)
  implements ContentType<BodyContent> {

  contentType: 'BodyContent';
  content: Immutable.OrderedMap<string, BodyElement>;
  guid: string;

  constructor(params?: BodyContentParams) {
    super(augment(params));
  }

  with(values: BodyContentParams) {
    return this.merge(values) as this;
  }

  clone(): BodyContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  supportedElements() {
    return SUPPORTED_ELEMENTS;
  }

  static fromPersistence(root: Object, guid: string) : BodyContent {

    const content = parseBodyContent(root);
    return new BodyContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
