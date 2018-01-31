import * as Immutable from 'immutable';
import { MaterialElementType, SUPPORTED_ELEMENTS as MATERIAL_ELEMENTS } from './material';
import { parseContent } from './parse';
import { augment, getChildren } from '../common';
import { ContentType, ContentElement } from './interfaces';

export type BodyElementType = MaterialElementType |
  'Definition' | 'Example' | 'Pullout' | 'Activity';


const SEMANTIC_ELEMENTS = ['popout', 'example', 'definition'];

export const SUPPORTED_ELEMENTS = [...SEMANTIC_ELEMENTS, ...MATERIAL_ELEMENTS];

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
