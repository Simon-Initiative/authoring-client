import * as Immutable from 'immutable';

import { BodyContent } from '../common/body';
import { augment } from '../common';

export type ContentParams = {
  availability?: string,
  body?: BodyContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'Content',
  availability: 'always',
  body: new BodyContent(),
  guid: '',
};

export class Content extends Immutable.Record(defaultContent) {

  contentType: 'Content';
  availability: string;
  body: BodyContent;
  guid: string;

  constructor(params?: ContentParams) {
    super(augment(params));
  }

  with(values: ContentParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Content {

    const content = (root as any).content;

    let model = new Content({ guid });
    model = model.with({ body: BodyContent.fromPersistence(content, '') });

    if (content['@availability'] !== undefined) {
      model = model.with({ availability: content['@availability'] });
    }

    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();
    const content = { content: (body as any) };

    content.content['@availability'] = this.availability;

    return content;
  }
}
