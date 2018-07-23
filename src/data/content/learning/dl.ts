import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from 'data/content/learning/title';
import { Dt } from 'data/content/learning/dt';
import { Dd } from 'data/content/learning/dd';
import { augment, getChildren, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/content/learning/common';
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

  clone(): Dl {
    return ensureIdGuidPresent(this.with({
      title: this.title.lift(t => t.clone()),
      content: this.content.mapEntries(([_, v]) => {
        const clone: TermOrDefinition = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, TermOrDefinition>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Dl {

    const t = (root as any).dl;

    let model = new Dl().with({ guid });

    model = setId(model, t, notify);

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(Title.fromPersistence(item, id, notify)) });
          break;
        case 'dt':
          model = model.with({
            content: model.content.set(id, Dt.fromPersistence(item, id, notify)),
          });
          break;
        case 'dd':
          model = model.with({
            content: model.content.set(id, Dd.fromPersistence(item, id, notify)),
          });
          break;

        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

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
