import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { augment, getChildren } from '../common';
import createGuid from 'utils/guid';

export type DdParams = {
  title?: Maybe<string>,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Dd',
  title: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
};

export class Dd extends Immutable.Record(defaultContent) {

  contentType: 'Dd';
  title: Maybe<string>;
  content: ContentElements;
  guid: string;

  constructor(params?: DdParams) {
    super(augment(params));
  }

  with(values: DdParams) {
    return this.merge(values) as this;
  }

  clone() : Dd {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Dd {

    const t = (root as any).dd;

    let model = new Dd().with({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(t['@title']) });
    }

    model = model.with({ content: ContentElements
      .fromPersistence(t, createGuid(), INLINE_ELEMENTS) });

    return model;
  }

  toPersistence() : Object {
    const dd = {
      dd: {
        '#array': this.content.toPersistence(),
      },
    };
    this.title.lift(t => dd.dd['@title'] = t);
    return dd;
  }
}
