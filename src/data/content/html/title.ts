import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { Text } from './text';

export type TitleParams = {
  text?: Text
  guid?: string,
};

const defaultContent = {
  contentType: 'Title',
  text: new Text(),
  guid: '',
};

export class Title extends Immutable.Record(defaultContent) {

  contentType: 'Title';
  text: Text;
  guid: string;

  constructor(params?: TitleParams) {
    super(augment(params));
  }

  with(values: TitleParams) {
    return this.merge(values) as this;
  }

  clone() : Title {
    return this.with({
      text: this.text.clone(),
    });
  }


  static fromPersistence(root: Object, guid: string) : Title {

    const t = (root as any).title;

    const text = new Text().with({ content: getChildren(t) });
    return new Title({ guid, text });

  }

  toPersistence() : Object {

    return {
      title: {
        '#array': this.text.toPersistence(),
      },
    };
  }
}
