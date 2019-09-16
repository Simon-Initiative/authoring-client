import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentElements, FLOW_ELEMENTS } from 'data/content/common/elements';
import { augment, ensureIdGuidPresent } from 'data/content/common';
import createGuid from 'utils/guid';

export type LiParams = {
  title?: Maybe<string>,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Li',
  elementType: 'li',
  title: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List(FLOW_ELEMENTS) }),
  guid: '',
};

export class Li extends Immutable.Record(defaultContent) {

  contentType: 'Li';
  elementType: 'li';
  title: Maybe<string>;
  content: ContentElements;
  guid: string;

  constructor(params?: LiParams) {
    super(augment(params));
  }

  with(values: LiParams) {
    return this.merge(values) as this;
  }

  clone(): Li {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(
    root: Object, guid: string, notify: () => void, backingTextProvider: Object = null): Li {

    const t = (root as any).li;

    let model = new Li().with({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(t['@title']) });
    }

    model = model.with({
      content: ContentElements
        .fromPersistence(t, createGuid(), FLOW_ELEMENTS, backingTextProvider, notify),
    });

    return model;
  }

  toPersistence(): Object {
    const li = {
      li: {
        '#array': this.content.toPersistence(),
      },
    };
    this.title.lift(t => li.li['@title'] = t);
    return li;
  }
}
