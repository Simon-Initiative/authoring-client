import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { Maybe } from 'tsmonad';
import { Default } from './default';
import { Alternative } from './alternative';

export type AlternativesParams = {
  id?: string,
  title?: Maybe<Title>,
  default?: Maybe<Default>,
  content?: Immutable.OrderedMap<string, Alternative>,
  group?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Alternatives',
  elementType: 'alternatives',
  id: '',
  title: Maybe.nothing(),
  group: Maybe.nothing(),
  content: Immutable.OrderedMap<string, Alternative>(),
  default: Maybe.nothing(),
  guid: '',
};

export class Alternatives extends Immutable.Record(defaultContent) {
  contentType: 'Alternatives';
  elementType: 'alternatives';
  id: string;
  title: Maybe<Title>;
  default: Maybe<Default>;
  content: Immutable.OrderedMap<string, Alternative>;
  group: Maybe<string>;
  guid: string;

  constructor(params?: AlternativesParams) {
    super(augment(params));
  }

  with(values: AlternativesParams) {
    return this.merge(values) as this;
  }

  clone(): Alternatives {
    return this.with({
      id: createGuid(),
      content: this.content.map(c => c.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string): Alternatives {
    const t = (root as any).alternatives;

    let model = new Alternatives({ guid });

    if (t['@group'] !== undefined) {
      model = model.with({ group: Maybe.just(t['@group']) });
    }
    if (t['@id']) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(Title.fromPersistence(item, id)) });
          break;
        case 'default':
          model = model.with({ default: Maybe.just(Default.fromPersistence(item, id)) });
          break;
        case 'alternative':
          model = model.with({
            content:
              model.content.set(id, Alternative.fromPersistence(item, id)),
          });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {

    const children = [];
    this.title.lift(title => children.push(title.toPersistence()));
    this.default.lift(def => children.push(def.toPersistence()));
    this.content.forEach(alt => children.push(alt.toPersistence()));

    const s = {
      alternatives: {
        '@id': this.id ? this.id : createGuid(),
        '#array': children,
      },
    };

    this.group.lift(g => s.alternatives['@group'] = g);

    return s;
  }
}
