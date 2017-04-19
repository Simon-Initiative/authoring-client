import * as Immutable from 'immutable';

import { Html } from './html';
import createGuid from '../../utils/guid';
import { getKey } from '../common';

export type FeedbackParams = {
  targets?: string,
  body?: Html
  guid?: string
};

const defaultContent = {
  contentType: 'Feedback',
  targets: '',
  body: new Html(),
  guid: createGuid()
}

export class Feedback extends Immutable.Record(defaultContent) {
  
  contentType: 'Feedback';
  targets: string;
  body: Html;
  guid: string;
  
  constructor(params?: FeedbackParams) {
    params ? super(params) : super();
  }

  with(values: FeedbackParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Feedback {

    let feedback = (root as any).feedback;

    let model = new Feedback({ guid });
    model = model.with({ body: Html.fromPersistence(feedback, '')});
    
    if (feedback['@targets'] !== undefined) {
      model = model.with({ targets: feedback['@targets']});
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
