import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, setId, getChildren } from '../common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { Question } from './question';
import { Answer } from './answer';
import { Title } from './title';
import { InquiryQuestion } from 'data/contentTypes';

export type InquiryParams = {
  questions?: Immutable.OrderedMap<string, Question>,
  title?: Title,
  id?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Inquiry',
  elementType: 'inquiry',
  questions: Immutable.OrderedMap<string, Question>(),
  title: Title.fromText(''),
  id: '',
  guid: '',
};

export class Inquiry extends Immutable.Record(defaultContent) {

  contentType: 'Inquiry';
  elementType: 'inquiry';
  questions: Immutable.OrderedMap<string, Question>;
  title: Title;
  id: string;
  guid: string;

  constructor(params?: InquiryParams) {
    super(augment(params));
  }

  with(values: InquiryParams) {
    return this.merge(values) as this;
  }

  clone(): Inquiry {
    return ensureIdGuidPresent(this.with({
      questions: this.questions.mapEntries(([_, v]) => {
        const clone: Question = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Question>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Inquiry {

    const t = (root as any).inquiry;

    let model = new Inquiry({ guid });

    model = setId(model, t, notify);

    let q = null;

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'question':
          q = Question.fromPersistence(item, id, notify);
          model = model.with({ questions: model.questions.set(q.guid, q) });

          break;
        case 'answer':
          const answer = Answer.fromPersistence(item, id, notify);

          // If question is null, we encountered an answer without a question,
          // but this is not possible given the DTD spec, so let's ignore it as it won't
          // validate anyways
          if (q !== null) {
            q = q.with({ answers: q.answers.set(answer.guid, answer) });
            model = model.with({ questions: model.questions.set(q.guid, q) });
          }

          break;
        case 'title':
          model = model.with(
            { title: Title.fromPersistence(item, id, notify) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    // Serialize the title, then each question followed by the question's answers
    const dummyQuestion = new InquiryQuestion();
    const children = this.questions.size > 0
      ? this.questions.toArray().reduce(
        (p, q) => {
          return [...p, q.toPersistence(), ...q.answers.toArray().map(a => a.toPersistence())];
        },
        [this.title.toPersistence()],
      )
      : [this.title.toPersistence(), dummyQuestion.toPersistence()];

    return {
      inquiry: {
        '#array': children,
        '@id': this.id,
      },
    };

  }
}
