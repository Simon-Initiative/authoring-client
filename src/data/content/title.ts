import * as Immutable from 'immutable';
import createGuid from '../../utils/guid';
import { augment } from './common';

export type TitleParams = {
  text?: string,
  guid?: string;
};

export class Title extends Immutable.Record({contentType: 'Title', guid: '', text: ''}) {
  
  contentType: 'Title';
  text: string;
  guid: string;
  
  constructor(params?: TitleParams) {
    super(augment(params));
  }

  with(values: TitleParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {
    return new Title().with({ text: (root as any).title['#text'], guid });
  }

  toPersistence() : Object {
    return {
      "title": {
        "#text": this.text
      }
    }
  }
}
