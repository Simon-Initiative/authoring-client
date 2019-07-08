import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import createGuid from '../../utils/guid';
import { getKey } from '../common';
import { LegacyTypes } from '../types';
import { FeedbackQuestion, FeedbackQuestions } from '../content/feedback/feedback_questions';
import { FeedbackDescription } from '../content/feedback/feedback_description';
import { Title } from '../content/learning/title';
import { ObjRef } from '../content/learning/objref';
import { Maybe } from 'tsmonad';
import { isArray } from 'util';
import { augment, ensureIdGuidPresent } from 'data/content/common';
import {
  ContentElements, TEXT_ELEMENTS, MATERIAL_ELEMENTS,
} from 'data/content/common/elements';
import guid from 'utils/guid';
import { createLikertSeries } from 'editors/content/question/addquestion/questionFactories';
import { ResourceGuid } from 'data/types';

// oli_feedback_1_2.dtd
export type FeedbackModelParams = {
  resource?: contentTypes.Resource,
  guid?: ResourceGuid,
  type?: LegacyTypes,
  lock?: contentTypes.Lock,
  title?: Title,
  shortTitle?: Maybe<string>,
  objrefs?: Immutable.OrderedMap<string, ObjRef>,
  description?: FeedbackDescription,
  // questions must be non-empty
  questions?: FeedbackQuestions,
};

const defaultFeedbackModelParams = {
  modelType: 'FeedbackModel',
  resource: new contentTypes.Resource(),
  guid: ResourceGuid.of(''),
  type: LegacyTypes.feedback,
  lock: new contentTypes.Lock(),
  title: Title.fromText('New Feedback'),
  shortTitle: Maybe.nothing<string>(),
  objrefs: Immutable.OrderedMap<string, ObjRef>(),
  description: new FeedbackDescription(),
  questions: new FeedbackQuestions(),
};

export class FeedbackModel extends Immutable.Record(defaultFeedbackModelParams) {
  modelType: 'FeedbackModel';
  resource: contentTypes.Resource;
  guid: ResourceGuid;
  type: LegacyTypes;
  lock: contentTypes.Lock;
  title: Title;
  shortTitle: Maybe<string>;
  objrefs: Immutable.OrderedMap<string, ObjRef>;
  description: FeedbackDescription;
  questions: FeedbackQuestions;

  constructor(params?: FeedbackModelParams) {
    super(augment(params));
  }

  with(values: FeedbackModelParams): FeedbackModel {
    return this.merge(values) as this;
  }

  clone(): FeedbackModel {
    return ensureIdGuidPresent(this.with({
      title: this.title.clone(),
      description: this.description.clone(),
      questions: this.questions.clone(),
      objrefs: this.objrefs.mapEntries(([_, v]) => {
        const clone: ObjRef = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, ObjRef>,
    }));
  }

  static createNew(id: string, title: string, description: string) {
    const series = createLikertSeries();
    return new FeedbackModel({
      title: new contentTypes.Title({
        text: ContentElements.fromText(title, guid(), TEXT_ELEMENTS),
      }),
      resource: new contentTypes.Resource({ id: ResourceGuid.of(id), title }),
      guid: ResourceGuid.of(id),
      description: new FeedbackDescription({
        content: ContentElements.fromText(description, '', MATERIAL_ELEMENTS),
      }),
      questions: new FeedbackQuestions({
        questions: Immutable.OrderedMap<string, FeedbackQuestion>([
          [series.guid, series],
        ]),
      }),
    });
  }

  static fromPersistence(json: any, notify: () => void = () => null): FeedbackModel {

    let model = new FeedbackModel();

    const o = (json as any);
    model = model.with({ resource: contentTypes.Resource.fromPersistence(o) });
    model = model.with({ guid: ResourceGuid.of(o.guid) });
    model = model.with({ type: o.type });
    if (o.lock !== undefined && o.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(o.lock) });
    }

    let fb = null;
    if (isArray(o.doc)) {
      fb = o.doc[0].feedback;
    } else {
      fb = o.doc.feedback;
    }

    fb['#array'].forEach((item) => {

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
      ...this.objrefs.toArray().map(item => item.toPersistence()),
      this.description.toPersistence(),
      this.questions.toPersistence(),
    );

    const doc = [{
      feedback: {
        '@id': this.resource.id.value(),
        '#array': children,
      },
    }];

    const root = {
      doc,
    };

    return Object.assign({}, this.resource, root, this.lock.toPersistence());
  }
}


export function getLabelForFeedbackQuestion(model: FeedbackQuestion) {
  switch (model.contentType) {
    case 'LikertSeries':
      return 'Question Series with Scale';
    case 'Likert':
      return 'Question with Scale';
    case 'FeedbackMultipleChoice':
      return 'Multiple Choice Question';
    case 'FeedbackOpenResponse':
      return 'Open-Ended Question';
    default:
      return 'Question';
  }
}
