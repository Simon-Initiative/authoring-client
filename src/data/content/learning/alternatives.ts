import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { Title } from 'data/content/learning/title';
import { Maybe } from 'tsmonad';
import { Default } from 'data/content/learning/default';
import { Alternative } from 'data/content/learning/alternative';

export type AlternativesParams = {
  id?: Maybe<string>,
  title?: Maybe<Title>,
  default?: Maybe<Default>,
  content?: Immutable.OrderedMap<string, Alternative>,
  group?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Alternatives',
  elementType: 'alternatives',
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  group: Maybe.nothing(),
  content: Immutable.OrderedMap<string, Alternative>(),
  default: Maybe.nothing(),
  guid: '',
};

export class Alternatives extends Immutable.Record(defaultContent) {
  contentType: 'Alternatives';
  elementType: 'alternatives';
  id: Maybe<string>;
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



  clone() : Alternatives {
    return this.with({
      content: this.content.map(c => c.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Alternatives {
    const t = (root as any).alternatives;

    let model = new Alternatives({ guid });

    if (t['@group'] !== undefined) {
      model = model.with({ group: Maybe.just(t['@group']) });
    }
    if (t['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(t['@id']) });
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
          model = model.with({ content:
            model.content.set(id, Alternative.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = [];
    this.title.lift(title => children.push(title.toPersistence()));
    this.default.lift(def => children.push(def.toPersistence()));
    this.content.forEach(alt => children.push(alt.toPersistence()));

    const s = {
      alternatives: {
        '#array': children,
      },
    };

    this.id.lift(g => s.alternatives['@id'] = g);
    this.group.lift(g => s.alternatives['@group'] = g);

    return s;
  }
}
