import * as Immutable from 'immutable';
import { FlowElementType, SUPPORTED_ELEMENTS as FLOW_ELEMENTS } from '../../common/flow';
import { parseContent } from '../../common/parse';
import { augment, getChildren } from '../../common';
import { ContentType, ContentElement } from '../../common/interfaces';
import { ContiguousText } from '../../learning/contiguous';
import createGuid from 'utils/guid';
import { Maybe } from 'tsmonad';

export type AlternativeFlowElementType = FlowElementType | 'Alternatives';


export interface AlternativeFlowElement extends ContentElement<AlternativeFlowElementType> {

}

export const SUPPORTED_ELEMENTS = [...FLOW_ELEMENTS, 'alternatives'];

export function parseAlternativeFlowContent(obj: Object)
  : Immutable.OrderedMap<string, AlternativeFlowElement> {

  return parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, AlternativeFlowElement>;
}

export type AlternativeFlowContentParams = {
  content?: Immutable.OrderedMap<string, AlternativeFlowElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'AlternativeFlowContent',
  content: Immutable.OrderedMap<string, AlternativeFlowElement>(),
  guid: '',
};

export class AlternativeFlowContent extends Immutable.Record(defaultContent)
  implements ContentType<AlternativeFlowElement> {

  contentType: 'AlternativeFlowContent';
  content: Immutable.OrderedMap<string, AlternativeFlowElement>;
  guid: string;

  constructor(params?: AlternativeFlowContentParams) {
    super(augment(params));
  }

  with(values: AlternativeFlowContentParams) {
    return this.merge(values) as this;
  }

  clone(): AlternativeFlowContent {
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

  static fromText(text: string, guid: string) : AlternativeFlowContent {
    const t = ContiguousText.fromText(text, createGuid());
    return new AlternativeFlowContent({ guid,
      content: Immutable.OrderedMap<string, AlternativeFlowElement>().set(t.guid, t) });
  }

  static fromPersistence(root: Object, guid: string) : AlternativeFlowContent {

    const content = parseAlternativeFlowContent(root);
    return new AlternativeFlowContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
