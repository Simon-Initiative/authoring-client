import * as Immutable from 'immutable';

import { ContentElements } from 'data/content/common//elements';
import { ALT_FLOW_ELEMENTS } from './types';
import { augment } from '../common';

export type FeedbackParams = {
  targets?: string,
  body?: ContentElements
  guid?: string,
};

const defaultContent = {
  contentType: 'Feedback',
  targets: '',
  body: new ContentElements().with({ supportedElements: Immutable.List(ALT_FLOW_ELEMENTS) }),
  guid: '',
};

export class Feedback extends Immutable.Record(defaultContent) {

  contentType: 'Feedback';
  targets: string;
  body: ContentElements;
  guid: string;

  constructor(params?: FeedbackParams) {
    super(augment(params));
  }

  with(values: FeedbackParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Feedback {

    const feedback = (root as any).feedback;

    let model = new Feedback({ guid });
    model = model.with({ body: ContentElements.fromPersistence(feedback, '', ALT_FLOW_ELEMENTS) });

    if (feedback['@targets'] !== undefined) {
      model = model.with({ targets: feedback['@targets'] });
    }

    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();
    const feedback = { feedback: (body as any) };

    feedback.feedback['@targets'] = this.targets;

    return feedback;
  }
}
