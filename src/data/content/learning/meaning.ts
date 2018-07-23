import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Material } from './material';
import { Example } from './example';
import { augment, getChildren, ensureIdGuidPresent, setId } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils//guid';

export type MeaningParams = {
  examples?: Immutable.OrderedMap<string, Example>,
  id?: string,
  title?: Maybe<string>,
  material?: Material,
  guid?: string,
};

const defaultContent = {
  contentType: 'Meaning',
  elementType: 'meaning',
  id: '',
  title: Maybe.nothing(),
  examples: Immutable.OrderedMap<string, Example>(),
  material: Material,
  guid: '',
};

export class Meaning extends Immutable.Record(defaultContent) {

  contentType: 'Meaning';
  elementType: 'meaning';
  examples: Immutable.OrderedMap<string, Example>;
  id: string;
  title: Maybe<string>;
  material: Material;
  guid: string;

  constructor(params?: MeaningParams) {
    super(augment(params, true));
  }

  with(values: MeaningParams) {
    return this.merge(values) as this;
  }

  clone(): Meaning {
    return ensureIdGuidPresent(this.with({
      examples: this.examples.mapEntries(([_, v]) => {
        const clone: Example = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Example>,
      material: this.material.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Meaning {

    const m = (root as any).meaning;
    let model = new Meaning().with({ guid });

    model = setId(model, m, notify);

    if (m['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(m['@title']) });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'example':
          model = model.with({ examples:
            model.examples.set(id, Example.fromPersistence(item, id, notify)) });
          break;
        case 'material':
          model = model.with({ material: Material.fromPersistence(item, id, notify) });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence() : Object {
    const m = {
      meaning: {
        '@id': this.id ? this.id : createGuid(),
        '#array': [
          this.material.toPersistence(),
        ],
      },
    };

    if (this.examples.size > 0) {
      this.examples.toArray().forEach(e => m.meaning['#array'].push(e.toPersistence()));
    }

    this.title.lift(title => m.meaning['@title'] = title);

    return m;
  }
}
