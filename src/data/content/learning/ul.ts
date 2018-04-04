import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from './title';
import { Li } from './li';
import { augment, getChildren } from '../common';
import { getKey } from './common';
import createGuid from 'utils/guid';

export enum Styles {
  None = 'none',
  Disc = 'disc',
  Circle = 'circle',
  Square = 'square',
}

export type UlParams = {
  id?: string,
  title?: Maybe<Title>,
  style?: Maybe<Styles>,
  start?: Maybe<string>,
  listItems?: Immutable.OrderedMap<string, Li>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Ul',
  id: '',
  style: Maybe.nothing(),
  title: Maybe.nothing(),
  listItems: Immutable.OrderedMap<string, Li>(),
  guid: '',
};

export class Ul extends Immutable.Record(defaultContent) {

  contentType: 'Ul';
  id: string;
  title: Maybe<Title>;
  style: Maybe<Styles>;
  listItems: Immutable.OrderedMap<string, Li>;
  guid: string;

  constructor(params?: UlParams) {
    super(augment(params));
  }

  with(values: UlParams) {
    return this.merge(values) as this;
  }

  clone() : Ul {
    return this.with({
      listItems: this.listItems.map(d => d.clone().with({ guid: createGuid() })).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Ul {

    const t = (root as any).ul;

    let model = new Ul().with({ guid });

    if (t['@style'] !== undefined) {
      model = model.with({ style: Maybe.just(t['@style']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(Title.fromPersistence(item, id)) });
          break;
        case 'li':
          model = model.with({ listItems: model.listItems.set(id, Li.fromPersistence(item, id)) });
          break;

        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = [];
    this.title.lift(title => children.push(title.toPersistence()));
    this.listItems.toArray().forEach(t => children.push(t.toPersistence()));

    const ul = {
      ul: {
        '@id': this.id,
        '#array': children,
      },
    };

    this.style.lift(value => ul.ul['@style'] = value);

    return ul;
  }
}
