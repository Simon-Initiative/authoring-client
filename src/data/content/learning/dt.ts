import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { augment, ensureIdGuidPresent } from '../common';
import createGuid from 'utils/guid';

export type DtParams = {
  title?: Maybe<string>,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Dt',
  elementType: 'dt',
  title: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
};

export class Dt extends Immutable.Record(defaultContent) {

  contentType: 'Dt';
  elementType: 'dt';
  title: Maybe<string>;
  content: ContentElements;
  guid: string;

  constructor(params?: DtParams) {
    super(augment(params));
  }

  with(values: DtParams) {
    return this.merge(values) as this;
  }

  clone() : Dt {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Dt {

    const t = (root as any).dt;

    let model = new Dt().with({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(t['@title']) });
    }

    model = model.with({ content: ContentElements
      .fromPersistence(t, createGuid(), INLINE_ELEMENTS, null, notify) });

    return model;
  }

  toPersistence() : Object {
    const dt = {
      dt: {
        '#array': this.content.toPersistence(),
      },
    };
    this.title.lift(t => dt.dt['@title'] = t);
    return dt;
  }
}
