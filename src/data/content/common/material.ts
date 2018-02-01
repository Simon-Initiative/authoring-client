import * as Immutable from 'immutable';
import { InlineElementType, SUPPORTED_ELEMENTS as INLINE_ELEMENTS } from './inline';
import { parseContent } from './parse';
import { augment, getChildren } from '../common';
import { ContentType, ContentElement } from './interfaces';

export type MaterialElementType = InlineElementType | 'WbInline';


export interface MaterialElement extends ContentElement<MaterialElement> {
  contentType: MaterialElementType;
}

export const SUPPORTED_ELEMENTS = [...INLINE_ELEMENTS, 'wb:inline'];

export function parseMaterialContent(obj: Object)
  : Immutable.OrderedMap<string, MaterialElement> {

  return parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, MaterialElement>;
}

export type MaterialContentParams = {
  content?: Immutable.OrderedMap<string, MaterialElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'MaterialContent',
  content: Immutable.OrderedMap<string, MaterialElement>(),
  guid: '',
};

export class MaterialContent extends Immutable.Record(defaultContent)
  implements ContentType<MaterialContent, MaterialElement> {

  contentType: 'MaterialContent';
  content: Immutable.OrderedMap<string, MaterialElement>;
  guid: string;

  constructor(params?: MaterialContentParams) {
    super(augment(params));
  }

  with(values: MaterialContentParams) {
    return this.merge(values) as this;
  }

  clone(): MaterialContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  supportedElements() {
    return SUPPORTED_ELEMENTS;
  }

  static fromPersistence(root: Object, guid: string) : MaterialContent {

    const content = parseMaterialContent(root);
    return new MaterialContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
