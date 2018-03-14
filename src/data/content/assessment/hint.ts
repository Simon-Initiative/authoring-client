import * as Immutable from 'immutable';

import { ContentElements } from 'data/content/common//elements';
import { ALT_FLOW_ELEMENTS } from './types';
import { augment } from '../common';

export type HintParams = {
  targets?: string,
  body?: ContentElements
  guid?: string,
};

const defaultContent = {
  contentType: 'Hint',
  targets: '',
  body: new ContentElements().with({ supportedElements: Immutable.List(ALT_FLOW_ELEMENTS) }),
  guid: '',
};

export class Hint extends Immutable.Record(defaultContent) {

  contentType: 'Hint';
  targets: string;
  body: ContentElements;
  guid: string;

  constructor(params?: HintParams) {
    super(augment(params));
  }

  with(values: HintParams) {
    return this.merge(values) as this;
  }

  static fromText(text: string, guid: string) : Hint {
    return new Hint().with({
      guid,
      body: ContentElements.fromText(text, '', Immutable.List(ALT_FLOW_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string) : Hint {

    const hint = (root as any).hint;

    let model = new Hint({ guid });
    model = model.with({ body: ContentElements.fromPersistence(hint, '', ALT_FLOW_ELEMENTS) });

    if (hint['@targets'] !== undefined) {
      model = model.with({ targets: hint['@targets'] });
    }

    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();
    const hint = { hint: { '#array': (body as any) } };

    hint.hint['@targets'] = this.targets;

    return hint;
  }
}
