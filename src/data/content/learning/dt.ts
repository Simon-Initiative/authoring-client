import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { augment } from '../common';
import createGuid from 'utils/guid';
import { Dd } from 'data/content/learning/dd';

export type DtParams = {
  title?: Maybe<string>,
  content?: ContentElements,
  guid?: string,
  // Virtual parameter - not serialized, but used in the dl component to implement Dt/Dd hierarchy
  definitions?: Immutable.OrderedMap<string, Dd>,
};

const defaultContent = {
  contentType: 'Dt',
  elementType: 'dt',
  title: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
  definitions: Immutable.OrderedMap<string, Dd>(),
};

export class Dt extends Immutable.Record(defaultContent) {

  contentType: 'Dt';
  elementType: 'dt';
  title: Maybe<string>;
  content: ContentElements;
  guid: string;
  definitions: Immutable.OrderedMap<string, Dd>;

  constructor(params?: DtParams) {
    super(augment(params));
  }

  with(values: DtParams) {
    return this.merge(values) as this;
  }

  clone(): Dt {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string): Dt {

    const t = (root as any).dt;

    let model = new Dt().with({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(t['@title']) });
    }

    model = model.with({
      content: ContentElements
        .fromPersistence(t, createGuid(), INLINE_ELEMENTS),
    });

    return model;
  }

  toPersistence(): Object {
    const dt = {
      dt: {
        '#array': this.content.toPersistence(),
      },
    };
    this.title.lift(t => dt.dt['@title'] = t);
    return dt;
  }
}
