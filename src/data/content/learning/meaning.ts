import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Material } from 'data/content/learning/material';
import { Example } from 'data/content/learning/example';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';

export type MeaningParams = {
  examples?: Immutable.OrderedMap<string, Example>,
  id?: Maybe<string>,
  title?: Maybe<string>,
  material?: Material,
  guid?: string,
};

const defaultContent = {
  contentType: 'Meaning',
  elementType: 'meaning',
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  examples: Immutable.OrderedMap<string, Example>(),
  material: Material,
  guid: '',
};

export class Meaning extends Immutable.Record(defaultContent) {

  contentType: 'Meaning';
  elementType: 'meaning';
  examples: Immutable.OrderedMap<string, Example>;
  id: Maybe<string>;
  title: Maybe<string>;
  material: Material;
  guid: string;

  constructor(params?: MeaningParams) {
    super(augment(params));
  }

  with(values: MeaningParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      examples: this.examples.map(c => this.clone()).toOrderedMap(),
      material: this.material.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Meaning {

    const m = (root as any).meaning;
    let model = new Meaning().with({ guid });

    if (m['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(m['@id']) });
    }
    if (m['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(m['@title']) });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'example':
          model = model.with({ examples:
            model.examples.set(id, Example.fromPersistence(item, id)) });
          break;
        case 'material':
          model = model.with({ material: Material.fromPersistence(item, id) });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence() : Object {
    const m = {
      meaning: {
        '#array': [
          this.material.toPersistence(),
        ],
      },
    };

    if (this.examples.size > 0) {
      this.examples.toArray().forEach(e => m.meaning['#array'].push(e.toPersistence()));
    }

    this.id.lift(id => m.meaning['@id'] = id);
    this.title.lift(title => m.meaning['@title'] = title);

    return m;
  }
}
