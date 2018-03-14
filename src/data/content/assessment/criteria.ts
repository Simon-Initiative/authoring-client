import * as Immutable from 'immutable';

import { ContentElements, MATERIAL_ELEMENTS } from 'data/content/common//elements';
import { augment } from '../common';

export type GradingCriteriaParams = {
  score?: string,
  name?: string,
  body?: ContentElements,
  guid?: string,
};

const defaultGradingCriteria = {
  contentType: 'GradingCriteria',
  score: '0',
  name: '',
  body: new ContentElements().with({ supportedElements: Immutable.List(MATERIAL_ELEMENTS) }),
  guid: '',
};

export class GradingCriteria extends Immutable.Record(defaultGradingCriteria) {

  contentType: 'GradingCriteria';
  score: string;
  name: string;
  body: ContentElements;
  guid: string;

  constructor(params?: GradingCriteriaParams) {
    super(augment(params));
  }

  with(values: GradingCriteriaParams) {
    return this.merge(values) as this;
  }


  static fromText(text: string, guid: string) : GradingCriteria {
    return new GradingCriteria().with({
      guid,
      body: ContentElements.fromText(text, '', Immutable.List(MATERIAL_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string) : GradingCriteria {

    const c = (root as any).grading_criteria;

    let model = new GradingCriteria({ guid });
    model = model.with({ body: ContentElements.fromPersistence(c, '', MATERIAL_ELEMENTS) });

    if (c['@score'] !== undefined) {
      model = model.with({ score: c['@score'] });
    }
    if (c['@name'] !== undefined) {
      model = model.with({ name: c['@name'] });
    }

    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();
    const criteria = { grading_criteria: { '#array': (body as any) } };

    criteria.grading_criteria['@score'] = this.score;
    criteria.grading_criteria['@name'] = this.name;

    return criteria;
  }
}
