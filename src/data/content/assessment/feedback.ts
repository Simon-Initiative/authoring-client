import * as Immutable from 'immutable';

import { AlternativeFlowContent } from './types/flow';
import { augment } from '../common';

export type FeedbackParams = {
  targets?: string,
  body?: AlternativeFlowContent
  guid?: string,
};

const defaultContent = {
  contentType: 'Feedback',
  targets: '',
  body: new AlternativeFlowContent(),
  guid: '',
};

export class Feedback extends Immutable.Record(defaultContent) {

  contentType: 'Feedback';
  targets: string;
  body: AlternativeFlowContent;
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
    model = model.with({ body: AlternativeFlowContent.fromPersistence(feedback, '') });

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
