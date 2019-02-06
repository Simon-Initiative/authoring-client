import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, setId } from '../common';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import createGuid from 'utils/guid';

export type AnswerParams = {
  content?: ContentElements,
  id?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Answer',
  elementType: 'answer',
  id: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
};

export class Answer extends Immutable.Record(defaultContent) {

  contentType: 'Answer';
  elementType: 'answer';
  content: ContentElements;
  id: string;
  guid: string;

  constructor(params?: AnswerParams) {
    super(augment(params));
  }

  with(values: AnswerParams) {
    return this.merge(values) as this;
  }

  clone(): Answer {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Answer {

    const t = (root as any).answer;

    let model = new Answer({
      guid,
      content: ContentElements.fromPersistence(t, '', INLINE_ELEMENTS, null, notify),
    });

    model = setId(model, t, notify);

    return model;
  }

  toPersistence(): Object {
    const t = {
      answer: {
        '@id': this.id ? this.id : createGuid(),
        '#array': this.content.toPersistence(),
      },
    };

    return t;
  }
}
