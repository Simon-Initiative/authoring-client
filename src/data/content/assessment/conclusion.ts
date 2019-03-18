import * as Immutable from 'immutable';

import { ContentElements, BODY_ELEMENTS, BOX_ELEMENTS } from 'data/content/common/elements';
import { augment } from '../common';

export type ConclusionParams = {
  body?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Conclusion',
  elementType: 'conclusion',
  body: new ContentElements().with({ supportedElements: Immutable.List(BOX_ELEMENTS) }),
  guid: '',
};

export class Conclusion extends Immutable.Record(defaultContent) {

  conclusionType: 'Conclusion';
  elementType: 'conclusion';
  body: ContentElements;
  guid: string;

  constructor(params?: ConclusionParams) {
    super(augment(params));
  }

  with(values: ConclusionParams) {
    return this.merge(values) as this;
  }

  static fromText(text: string, guid: string): Conclusion {
    return new Conclusion().with({
      guid,
      body: ContentElements.fromText(text, '', Immutable.List(BOX_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string, notify?: () => void): Conclusion {

    const conclusion = (root as any).conclusion;

    let model = new Conclusion({ guid });
    model = model.with({
      body: ContentElements.fromPersistence(conclusion, '', BODY_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {

    const body = this.body.toPersistence();
    const conclusion = { conclusion: { '#array': (body as any) } };

    return conclusion;
  }
}
