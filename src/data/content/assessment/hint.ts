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
  elementType: 'hint',
  targets: '',
  body: new ContentElements().with({ supportedElements: Immutable.List(ALT_FLOW_ELEMENTS) }),
  guid: '',
};

export class Hint extends Immutable.Record(defaultContent) {

  contentType: 'Hint';
  elementType: 'hint';
  targets: string;
  body: ContentElements;
  guid: string;

  constructor(params?: HintParams) {
    super(augment(params));
  }

  with(values: HintParams) {
    return this.merge(values) as this;
  }

  clone(): Hint {
    return this.with({
      body: this.body.clone(),
    });
  }

  static fromText(text: string, guid: string): Hint {
    return new Hint().with({
      guid,
      body: ContentElements.fromText(text, '', Immutable.List(ALT_FLOW_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Hint {

    const hint = (root as any).hint;

    let model = new Hint({ guid });
    model = model.with({
      body: ContentElements.fromPersistence(hint, '', ALT_FLOW_ELEMENTS, null, notify),
    });

    if (hint['@targets'] !== undefined) {
      model = model.with({ targets: hint['@targets'] });
    }

    return model;
  }

  toPersistence(): Object {

    const body = this.body.toPersistence();
    const hint = { hint: { '#array': (body as any) } };

    hint.hint['@targets'] = this.targets;

    return hint;
  }
}
