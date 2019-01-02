import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import createGuid from '../../utils/guid';
import { getKey } from '../common';
import { LegacyTypes } from '../types';
import { FeedbackQuestion, FeedbackQuestions } from '../content/feedback/feedback_questions';
import { FeedbackDescription } from '../content/feedback/feedback_description';
import { getChildren } from '../content/common';
import { Title } from '../content/learning/title';
import { ObjRef } from '../content/learning/objref';
import { LikertSeries } from '../content/feedback/likert_series';
import { Maybe } from 'tsmonad';

// oli_feedback_1_2.dtd
export type FeedbackModelParams = {
  modelType?: string,
  guid?: string,
  id?: string,
  type?: LegacyTypes,
  lock?: contentTypes.Lock,
  title?: Title,
  shortTitle?: Maybe<string>,
  objrefs?: Immutable.OrderedMap<string, ObjRef>,
  description?: FeedbackDescription,
  // questions must be non-empty
  questions?: FeedbackQuestions,
};

const defaultFeedbackModelParams: FeedbackModelParams = {
  modelType: 'FeedbackModel',
  guid: '',
  id: '',
  type: LegacyTypes.feedback,
  lock: new contentTypes.Lock(),
  title: Title.fromText('New Feedback'),
  shortTitle: Maybe.nothing<string>(),
  objrefs: Immutable.OrderedMap<string, ObjRef>(),
  description: new FeedbackDescription(),
  questions: new FeedbackQuestions({
    questions: Immutable.OrderedMap<string, FeedbackQuestion>([
      [createGuid(), new LikertSeries()],
    ]),
  }),
};

export class FeedbackModel
  extends Immutable.Record(defaultFeedbackModelParams) {
  modelType?: string;
  guid?: string;
  id?: string;
  type?: LegacyTypes;
  lock?: contentTypes.Lock;
  title?: Title;
  shortTitle: Maybe<string>;
  objrefs?: Immutable.OrderedMap<string, ObjRef>;
  description?: FeedbackDescription;
  questions?: Immutable.OrderedMap<string, FeedbackQuestion>;

  constructor(params?: FeedbackModelParams) {
    super(params);
  }

  with(values: FeedbackModelParams): FeedbackModel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, notify: () => void = () => null): FeedbackModel {

    let model = new FeedbackModel({ guid: createGuid() });

    const o = (json as any);

    if (o.lock !== undefined && o.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(o.lock) });
    }

    // id required
    model = model.with({ id: o['@id'] });

    getChildren(o).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        case 'short_title':
          model = model.with({ shortTitle: Maybe.just((item as any).short_title) });
          break;

        case 'objref':
          model = model.with({
            objrefs: model.objrefs.set(id, ObjRef.fromPersistence(item, id, notify)),
          });
          break;
        case 'description':
          model = model.with({
            description: FeedbackDescription.fromPersistence(item, id, notify),
          });
          break;
        case 'questions':
          model = model.with({
            questions: FeedbackQuestions.fromPersistence(item, id, notify),
          });
          break;
        default:
          break;
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children = [
      this.title.toPersistence(),
    ];

    this.shortTitle.lift(item => children.push({ short_title: item }));

    children.push(
      ...this.objrefs.toArray().map(item => item.toPersistence()), this.description.toPersistence(),
      ...this.questions.toArray().map(item => item.toPersistence()),
    );

    return {
      feedback: {
        '#array': children,
      },
    };
  }
}
