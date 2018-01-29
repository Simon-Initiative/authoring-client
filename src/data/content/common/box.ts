import * as Immutable from 'immutable';
import { MaterialElementType, SUPPORTED_ELEMENTS as MATERIAL_ELEMENTS } from './material';
import { parseContent } from './parse';
import { augment, getChildren } from '../common';
import { ContentType, ContentElement } from './interfaces';

export type BoxElementType = MaterialElementType | 'Materials' | 'Alternatives';


export interface BoxElement extends ContentElement<BoxElement> {
  contentType: BoxElementType;
}

export const SUPPORTED_ELEMENTS = [...MATERIAL_ELEMENTS, 'materials', 'alternatives'];

export function parseBoxContent(obj: Object)
  : Immutable.OrderedMap<string, BoxElement> {

  return parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, BoxElement>;
}

export type BoxContentParams = {
  content?: Immutable.OrderedMap<string, BoxElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'BoxContent',
  content: Immutable.OrderedMap<string, BoxElement>(),
  guid: '',
};

export class BoxContent extends Immutable.Record(defaultContent)
  implements ContentType<BoxContent> {

  contentType: 'BoxContent';
  content: Immutable.OrderedMap<string, BoxElement>;
  guid: string;

  constructor(params?: BoxContentParams) {
    super(augment(params));
  }

  with(values: BoxContentParams) {
    return this.merge(values) as this;
  }

  clone(): BoxContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  supportedElements() {
    return SUPPORTED_ELEMENTS;
  }

  static fromPersistence(root: Object, guid: string) : BoxContent {

    const content = parseBoxContent(root);
    return new BoxContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
