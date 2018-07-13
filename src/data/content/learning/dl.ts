import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from './title';
import { Dt } from './dt';
import { Dd } from './dd';
import { augment, getChildren } from '../common';
import { getKey } from './common';
import createGuid from 'utils/guid';

export type TermOrDefinition = Dt | Dd;

export type DlParams = {
  id?: string,
  title?: Maybe<Title>,
  content?: Immutable.OrderedMap<string, TermOrDefinition>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Dl',
  elementType: 'dl',
  id: createGuid(),
  title: Maybe.nothing(),
  content: Immutable.OrderedMap<string, TermOrDefinition>(),
  guid: '',
};

export class Dl extends Immutable.Record(defaultContent) {

  contentType: 'Dl';
  elementType: 'dl';
  id: string;
  title: Maybe<Title>;
  content: Immutable.OrderedMap<string, TermOrDefinition>;
  guid: string;

  constructor(params?: DlParams) {
    super(augment(params));
  }

  with(values: DlParams) {
    return this.merge(values) as this;
  }

  clone() : Dl {
    return this.with({
      id: createGuid(),
      content: this.content.map(d => d.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Dl {

    const t = (root as any).dl;

    let model = new Dl().with({ guid });

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
        case 'dt':
          model = model.with({ content: model.content.set(id, Dt.fromPersistence(item, id)) });
          break;
        case 'dd':
          model = model.with({ content: model.content.set(id, Dd.fromPersistence(item, id)) });
          break;

        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = this.content.toArray().map(t => t.toPersistence());
    this.title.lift(t => children.push(t.toPersistence()));

    return {
      dl: {
        '@id': this.id,
        '#array': children,
      },
    };

  }
}
