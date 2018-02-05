import * as Immutable from 'immutable';
import { BodyElementType as LearningBodyElementType, SUPPORTED_ELEMENTS as BODY_ELEMENTS }
  from '../../common/body';
import { parseContent } from '../../common/parse';
import { ContiguousText } from '../../learning/contiguous';
import { augment, getChildren } from '../../common';
import { ContentType, ContentElement } from '../../common/interfaces';
import createGuid from 'utils/guid';

export type BodyElementType = LearningBodyElementType |
  'Section' | 'Activity' | 'WbInline';

const WB_EXTENSIONS = ['activity', 'section', 'wb:inline'];

export const SUPPORTED_ELEMENTS = [...WB_EXTENSIONS, ...BODY_ELEMENTS];

function parseBodyContent(obj: Object)
  : Immutable.OrderedMap<string, BodyElement> {

  return parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, BodyElement>;
}


export interface BodyElement extends ContentElement<BodyElementType> {

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
  implements ContentType<BodyElement> {

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

  static fromText(text: string, guid: string) : BodyContent {
    const t = ContiguousText.fromText(text, createGuid());
    return new BodyContent({ guid,
      content: Immutable.OrderedMap<string, BodyElement>().set(t.guid, t) });
  }

  static fromPersistence(root: Object, guid: string) : BodyContent {

    const content = parseBodyContent(root);
    return new BodyContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
