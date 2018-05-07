import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Material } from './material';
import { Example } from './example';
import { Image } from './image';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils//guid';

export type SpeakerParams = {
  guid?: string,
  id?: Maybe<string>,
  title?: Maybe<string>,

  name?: Immutable.OrderedMap<string, string>;
  image?: Immutable.OrderedMap<string, Image>,
};

const defaultContent = {
  contentType: 'Speaker',
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  examples: Immutable.OrderedMap<string, Example>(),
  material: Material,
  guid: '',
};

export class Speaker extends Immutable.Record(defaultContent) {

  contentType: 'Speaker';
  examples: Immutable.OrderedMap<string, Example>;
  id: Maybe<string>;
  title: Maybe<string>;
  material: Material;
  guid: string;

  constructor(params?: SpeakerParams) {
    super(augment(params));
  }

  with(values: SpeakerParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      examples: this.examples.map(c => this.clone()).toOrderedMap(),
      material: this.material.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Speaker {

    const m = (root as any).Speaker;
    let model = new Speaker().with({ guid });

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
      Speaker: {
        '#array': [
          this.material.toPersistence(),
        ],
      },
    };

    if (this.examples.size > 0) {
      this.examples.toArray().forEach(e => m.Speaker['#array'].push(e.toPersistence()));
    }

    this.id.lift(id => m.Speaker['@id'] = id);
    this.title.lift(title => m.Speaker['@title'] = title);

    return m;
  }
}
