import * as Immutable from 'immutable';

import { Html } from './html';
import { augment } from './common';
import { getKey } from '../common';

export type ContentParams = {
  availability?: string,
  body?: Html,
  guid?: string,
};

const defaultContent = {
  contentType: 'Content',
  availability: 'always',
  body: new Html(),
  guid: '',
};

export class Content extends Immutable.Record(defaultContent) {
  
  contentType: 'Content';
  availability: string;
  body: Html;
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
    model = model.with({ body: Html.fromPersistence(content, '') });
    
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
