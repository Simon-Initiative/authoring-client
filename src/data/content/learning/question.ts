import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, setId } from '../common';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { Answer } from './answer';
import createGuid from 'utils/guid';

export type QuestionParams = {
  content?: ContentElements,
  answers?: Immutable.OrderedMap<string, Answer>,
  id?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'InquiryQuestion',
  elementType: 'question',
  id: '',
  answers: Immutable.OrderedMap<string, Answer>(),
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
};

export class Question extends Immutable.Record(defaultContent) {

  contentType: 'InquiryQuestion';
  elementType: 'question';
  content: ContentElements;
  answers: Immutable.OrderedMap<string, Answer>;
  id: string;
  guid: string;

  constructor(params?: QuestionParams) {
    super(augment(params));
  }

  with(values: QuestionParams) {
    return this.merge(values) as this;
  }

  clone(): Question {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
      answers: this.answers.mapEntries(([_, v]) => {
        const clone: Answer = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Answer>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Question {

    const t = (root as any).question;

    // Notice that answers do not get read from questions, rather they are siblings
    // to questions and get read from within inquiry.  They are presenet in this
    // wrapper to better model the constraints

    let model = new Question({
      guid,
      content: ContentElements.fromPersistence(t, '', INLINE_ELEMENTS, null, notify),
    });

    model = setId(model, t, notify);

    return model;
  }

  toPersistence(): Object {
    const t = {
      question: {
        '@id': this.id ? this.id : createGuid(),
        '#array': this.content.toPersistence(),
      },
    };

    return t;
  }
}
