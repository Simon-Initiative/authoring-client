import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from 'data/content/learning/title';
import { Dt } from 'data/content/learning/dt';
import { Dd } from 'data/content/learning/dd';
import { augment, getChildren, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/content/learning/common';
import createGuid from 'utils/guid';

export type DlParams = {
  id?: string,
  title?: Maybe<Title>,
  terms?: Immutable.OrderedMap<string, Dt>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Dl',
  elementType: 'dl',
  id: '',
  title: Maybe.nothing(),
  terms: Immutable.OrderedMap<string, Dt>(),
  guid: '',
};

export class Dl extends Immutable.Record(defaultContent) {

  contentType: 'Dl';
  elementType: 'dl';
  id: string;
  title: Maybe<Title>;
  terms: Immutable.OrderedMap<string, Dt>;
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
      terms: this.terms.mapEntries(([_, v]) => {
        const clone: Dt = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Dt>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Dl {

    const t = (root as any).dl;

    let model = new Dl().with({ guid });

    model = setId(model, t, notify);

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      /* Dt/Dd hierarchy is not enforced by the DTD, so we create a virtual hierarchy of terms /
      definitions here. In reality, Dls have an XML representation that looks something like:
      <Dl>
        <Dt>Term 1</Dt>
        <Dd>Def 1</Dd>
        <Dd>Def 2</Dd>
        <Dt>Term 2</Dt>
        <Dd>Def 1</Dd>
      </Dl>
      So the sibling Dds following each Dt 'belong' to that Dt.
       */
      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(Title.fromPersistence(item, id, notify)) });
          break;
        case 'dt':
          model = model.with({ terms: model.terms.set(id, Dt.fromPersistence(item, id, notify)) });
          break;
        case 'dd':
          // Attach the dd to the last dt created
          if (model.terms.size > 0) {
            const lastTerm = model.terms.last();
            model = model.with({
              terms: model.terms.set(lastTerm.guid, lastTerm.with({
                definitions: lastTerm.definitions.set(id, Dd.fromPersistence(item, id, notify)),
              })),
            });
          }
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children: any = [];

    this.title.lift(t => children.push(t.toPersistence()));

    // Each dt has a list of attached dds, so we need to serialize them in order as siblings
    children.push(...this.terms.toArray()
      .map(dt => ([dt] as (Dt | Dd)[]).concat(dt.definitions.toArray()))
      .reduce((acc, curr) => acc.concat(curr))
      .map(dtOrDd => dtOrDd.toPersistence()));

    return {
      dl: {
        '@id': this.id,
        '#array': children,
      },
    };
  }
}
