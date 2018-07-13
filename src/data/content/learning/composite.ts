import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, except } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { ContentElements, BOX_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import { Instructions } from './instructions';

export type CompositeParams = {
  id?: string,
  title?: Maybe<Title>,
  purpose?: Maybe<string>,
  instructions?: Maybe<Instructions>,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Composite',
  elementType: 'composite',
  id: createGuid(),
  title: Maybe.nothing(),
  purpose: Maybe.nothing(),
  instructions: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List<string>(BOX_ELEMENTS) }),
  guid: '',
};

export class Composite extends Immutable.Record(defaultContent) {
  contentType: 'Composite';
  elementType: 'composite';
  id: string;
  title: Maybe<Title>;
  purpose: Maybe<string>;
  instructions: Maybe<Instructions>;
  content: ContentElements;
  guid: string;

  constructor(params?: CompositeParams) {
    super(augment(params));
  }

  with(values: CompositeParams) {
    return this.merge(values) as this;
  }

  clone() : Composite {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Composite {
    const t = (root as any).composite_activity;

    let model = new Composite({ guid });

    if (t['@id']) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(Title.fromPersistence(item, id)) });
          break;
        case 'instructions':
          model = model.with({ instructions: Maybe.just(Instructions.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    model = model.with({ content: ContentElements
      .fromPersistence(except(getChildren(t), 'title', 'instructions'), '', BOX_ELEMENTS) });

    return model;
  }

  toPersistence() : Object {

    const optional = [];

    this.title.lift(title => optional.push(title.toPersistence()));
    this.instructions.lift(i => optional.push(i.toPersistence()));

    const required = this.content.content.size === 0
      ? [{ p: { '#text': ' ' } }]
      : this.content.toPersistence();

    const s = {
      composite_activity: {
        '@id': this.id,
        '#array': [...optional, ...required],
      },
    };
    this.purpose.lift(p => s.composite_activity['@purpose'] = p);

    return s;
  }
}
