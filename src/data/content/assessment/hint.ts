import * as Immutable from 'immutable';

import { FlowContent } from '../common/flow';
import { augment } from '../common';

export type HintParams = {
  targets?: string,
  body?: FlowContent
  guid?: string,
};

const defaultContent = {
  contentType: 'Hint',
  targets: '',
  body: new FlowContent(),
  guid: '',
};

export class Hint extends Immutable.Record(defaultContent) {

  contentType: 'Hint';
  targets: string;
  body: FlowContent;
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
    model = model.with({ body: FlowContent.fromPersistence(hint, '') });

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
