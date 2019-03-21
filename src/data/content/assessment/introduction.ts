import * as Immutable from 'immutable';

import { ContentElements, BODY_ELEMENTS, BOX_ELEMENTS } from 'data/content/common/elements';
import { augment } from '../common';

export type IntroductionParams = {
  body?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Introduction',
  elementType: 'introduction',
  body: new ContentElements().with({ supportedElements: Immutable.List(BOX_ELEMENTS) }),
  guid: '',
};

export class Introduction extends Immutable.Record(defaultContent) {

  introductionType: 'Introduction';
  elementType: 'introduction';
  body: ContentElements;
  guid: string;

  constructor(params?: IntroductionParams) {
    super(augment(params));
  }

  with(values: IntroductionParams) {
    return this.merge(values) as this;
  }

  static fromText(text: string, guid: string): Introduction {
    return new Introduction().with({
      guid,
      body: ContentElements.fromText(text, '', Immutable.List(BOX_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string, notify?: () => void): Introduction {

    const introduction = (root as any).introduction;

    let model = new Introduction({ guid });
    model = model.with({
      body: ContentElements.fromPersistence(introduction, '', BODY_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {

    const body = this.body.toPersistence();
    const introduction = { introduction: { '#array': (body as any) } };

    return introduction;
  }
}
