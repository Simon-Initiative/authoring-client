import * as Immutable from 'immutable';

import { AlternativeFlowContent } from './types/flow';
import { augment } from '../common';

export type HintParams = {
  targets?: string,
  body?: AlternativeFlowContent
  guid?: string,
};

const defaultContent = {
  contentType: 'Hint',
  targets: '',
  body: new AlternativeFlowContent(),
  guid: '',
};

export class Hint extends Immutable.Record(defaultContent) {

  contentType: 'Hint';
  targets: string;
  body: AlternativeFlowContent;
  guid: string;

  constructor(params?: HintParams) {
    super(augment(params));
  }

  with(values: HintParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Hint {

    const hint = (root as any).hint;

    let model = new Hint({ guid });
    model = model.with({ body: AlternativeFlowContent.fromPersistence(hint, '') });

    if (hint['@targets'] !== undefined) {
      model = model.with({ targets: hint['@targets'] });
    }

    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();
    const hint = { hint: (body as any) };

    hint.hint['@targets'] = this.targets;

    return hint;
  }
}
