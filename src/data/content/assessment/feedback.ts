import * as Immutable from 'immutable';

import { ContentElements } from 'data/content/common/elements';
import { ALT_FLOW_ELEMENTS } from './types';
import { augment } from '../common';

export type FeedbackParams = {
  targets?: string,
  // 'lang' is used in branching assessments to point to the question that is revealed when
  // a particular feedback item is given
  lang?: string,
  body?: ContentElements
  guid?: string,
};

const defaultContent = {
  contentType: 'Feedback',
  elementType: 'feedback',
  targets: '',
  lang: '',
  body: new ContentElements().with({ supportedElements: Immutable.List(ALT_FLOW_ELEMENTS) }),
  guid: '',
};

export class Feedback extends Immutable.Record(defaultContent) {

  contentType: 'Feedback';
  elementType: 'feedback';
  targets: string;
  lang: string;
  body: ContentElements;
  guid: string;

  constructor(params?: FeedbackParams) {
    super(augment(params));
  }

  clone(): Feedback {
    return this.with({
      body: this.body.clone(),
    });
  }

  with(values: FeedbackParams) {
    return this.merge(values) as this;
  }

  static fromText(text: string, guid: string): Feedback {
    return new Feedback().with({
      guid,
      body: ContentElements.fromText(text, '', Immutable.List(ALT_FLOW_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Feedback {

    const feedback = (root as any).feedback;

    let model = new Feedback({ guid });
    model = model.with({
      body: ContentElements.fromPersistence(feedback, '', ALT_FLOW_ELEMENTS, null, notify),
    });

    if (feedback['@targets'] !== undefined) {
      model = model.with({ targets: feedback['@targets'] });
    }

    if (feedback['@lang'] !== undefined && feedback['@lang'] !== '') {
      model = model.with({ lang: feedback['@lang'] });
    }

    return model;
  }

  toPersistence(): Object {

    const body = this.body.toPersistence();
    const feedback = { feedback: { '#array': (body as any) } };

    feedback.feedback['@targets'] = this.targets;
    if (this.lang) {
      feedback.feedback['@lang'] = this.lang;
    }

    return feedback;
  }
}
