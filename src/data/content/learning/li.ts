import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { FlowContent } from '../common/flow';
import { augment, getChildren } from '../common';
import createGuid from 'utils/guid';

export type LiParams = {
  title?: Maybe<string>,
  content?: FlowContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'Li',
  title: Maybe.nothing(),
  content: new FlowContent(),
  guid: '',
};

export class Li extends Immutable.Record(defaultContent) {

  contentType: 'Li';
  title: Maybe<string>;
  content: FlowContent;
  guid: string;

  constructor(params?: LiParams) {
    super(augment(params));
  }

  with(values: LiParams) {
    return this.merge(values) as this;
  }

  clone() : Li {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Li {

    const t = (root as any).li;

    let model = new Li().with({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(t['@title']) });
    }

    model = model.with({ content: FlowContent.fromPersistence(t, createGuid()) });

    return model;
  }

  toPersistence() : Object {
    const li = {
      li: {
        '#array': this.content.toPersistence(),
      },
    };
    this.title.lift(t => li.li['@title'] = t);
    return li;
  }
}
