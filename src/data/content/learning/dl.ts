import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from 'data/content/learning/title';
import { Dt } from 'data/content/learning/dt';
import { Dd } from 'data/content/learning/dd';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/content/learning/common';
import createGuid from 'utils/guid';

export type TermOrDefinition = Dt | Dd;

export type DlParams = {
  title?: Maybe<Title>,
  content?: Immutable.OrderedMap<string, TermOrDefinition>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Dl',
  elementType: 'dl',
  title: Maybe.nothing(),
  content: Immutable.OrderedMap<string, TermOrDefinition>(),
  guid: '',
};

export class Dl extends Immutable.Record(defaultContent) {

  contentType: 'Dl';
  elementType: 'dl';
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
      content: this.content.map(d => d.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Dl {

    const t = (root as any).dl;

    let model = new Dl().with({ guid });

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
        '#array': children,
      },
    };

  }
}
