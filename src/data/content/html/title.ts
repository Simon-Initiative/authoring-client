import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { TextContent } from '../types/text';

export type TitleParams = {
  text?: TextContent
  guid?: string,
};

const defaultContent = {
  contentType: 'Title',
  text: new TextContent(),
  guid: '',
};

export class Title extends Immutable.Record(defaultContent) {

  contentType: 'Title';
  text: TextContent;
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

    const text = TextContent.fromPersistence(getChildren(t), '');
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
