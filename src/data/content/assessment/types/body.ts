import * as Immutable from 'immutable';
import { FlowElementType, SUPPORTED_ELEMENTS as FLOW_ELEMENTS } from '../../common/flow';
import { parseContent } from '../../common/parse';
import { augment, getChildren } from '../../common';
import { ContentType, ContentElement } from '../../common/interfaces';
import { Maybe } from 'tsmonad';
import { ContiguousText } from '../../learning/contiguous';
import createGuid from 'utils/guid';
import { Changes } from 'data/content/learning/draft/changes';

export type QuestionBodyElementType = FlowElementType | 'Alternatives' | 'Custom';


export interface QuestionBodyElement extends ContentElement<QuestionBodyElementType> {

}

export const SUPPORTED_ELEMENTS = [...FLOW_ELEMENTS, 'alternatives', 'custom'];

export function parseQuestionBodyContent(obj: Object)
  : Immutable.OrderedMap<string, QuestionBodyElement> {

  return parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, QuestionBodyElement>;
}

export type QuestionBodyContentParams = {
  content?: Immutable.OrderedMap<string, QuestionBodyElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'QuestionBodyContent',
  content: Immutable.OrderedMap<string, QuestionBodyElement>(),
  guid: '',
};

export class QuestionBodyContent extends Immutable.Record(defaultContent)
  implements ContentType<QuestionBodyElement> {

  contentType: 'QuestionBodyContent';
  content: Immutable.OrderedMap<string, QuestionBodyElement>;
  guid: string;

  constructor(params?: QuestionBodyContentParams) {
    super(augment(params));
  }

  with(values: QuestionBodyContentParams) {
    return this.merge(values) as this;
  }


  // TODO: Generalize this functionality allowing visitation and
  // update of any text or element entity, filtered based on type
  tagInputRefsWithType(byId: Object) {
    return this.with({
      content: this.content.map((c) => {
        if (c.contentType === 'ContiguousText') {
          return (c as ContiguousText).tagInputRefsWithType(byId);
        }
        return c;
      }).toOrderedMap(),
    });
  }

  detectInputRefChanges(previous: QuestionBodyContent) : Changes {

    const initial : Changes = {
      additions: Immutable.List(),
      deletions: Immutable.List(),
    };

    return this.content.toArray()
      .filter(c => c.contentType === 'ContiguousText')
      .reduce(
        (delta, c) => {
          const p = previous.content.get(c.guid);
          if (p !== undefined) {
            const changes = (c as ContiguousText).detectInputRefChanges(p as ContiguousText);
            return {
              additions: delta.additions.concat(changes.additions).toList(),
              deletions: delta.deletions.concat(changes.deletions).toList(),
            };
          }
          return delta;
        },
        initial);
  }

  extractPlainText() : Maybe<string> {
    const t = this.content.toArray().filter(c => c.contentType === 'ContiguousText');
    if (t.length > 0) {
      return (t[0] as ContiguousText).extractPlainText();
    }
    return Maybe.nothing();
  }


  clone(): QuestionBodyContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  supportedElements() {
    return SUPPORTED_ELEMENTS;
  }


  static fromText(text: string, guid: string) : QuestionBodyContent {
    const t = ContiguousText.fromText(text, createGuid());
    return new QuestionBodyContent({ guid,
      content: Immutable.OrderedMap<string, QuestionBodyElement>().set(t.guid, t) });
  }

  static fromPersistence(root: Object, guid: string) : QuestionBodyContent {

    const content = parseQuestionBodyContent(root);
    return new QuestionBodyContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
