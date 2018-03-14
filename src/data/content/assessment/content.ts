import * as Immutable from 'immutable';

import { ContentElements, BODY_ELEMENTS, BOX_ELEMENTS } from 'data/content/common//elements';
import { augment } from '../common';

export type ContentParams = {
  availability?: string,
  body?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Content',
  availability: 'always',
  body: new ContentElements().with({ supportedElements: Immutable.List(BOX_ELEMENTS) }),
  guid: '',
};

export class Content extends Immutable.Record(defaultContent) {

  contentType: 'Content';
  availability: string;
  body: ContentElements;
  guid: string;

  constructor(params?: ContentParams) {
    super(augment(params));
  }

  with(values: ContentParams) {
    return this.merge(values) as this;
  }

  static fromText(text: string, guid: string) : Content {
    return new Content().with({
      guid,
      body: ContentElements.fromText(text, '', Immutable.List(BOX_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string) : Content {

    const content = (root as any).content;

    let model = new Content({ guid });
    model = model.with({ body: ContentElements.fromPersistence(content, '', BODY_ELEMENTS) });

    if (content['@available'] !== undefined) {
      model = model.with({ availability: content['@available'] });
    }

    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();
    const content = { content: { '#array': (body as any) } };

    content.content['@available'] = this.availability;

    return content;
  }
}
