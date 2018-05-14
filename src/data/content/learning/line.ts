import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Translation } from './translation';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils//guid';
import { Material } from 'data/content/learning/material';

export type LineParams = {
  guid?: string,
  id?: Maybe<string>,
  title?: Maybe<string>,
  speaker?: string,
  material?: Material,
  translations?: Immutable.OrderedMap<string, Translation>,
};

const defaultContent = {
  contentType: 'Line',
  elementType: 'line',
  guid: '',
  id: Maybe.nothing<string>(),
  title: Maybe.nothing<string>(),
  speaker: '',
  material: new Material(),
  translations: Immutable.OrderedMap<string, Translation>(),
};

export class Line extends Immutable.Record(defaultContent) {

  contentType: 'Line';
  elementType: 'line';
  guid: string;
  id: Maybe<string>;
  title: Maybe<string>;
  speaker: '';
  material: Material;
  translations: Immutable.OrderedMap<string, Translation>;

  constructor(params?: LineParams) {
    super(augment(params));
  }

  with(values: LineParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      guid: createGuid(),
      material: this.material.clone(),
      translations: this.translations.map(t => t.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string): Line {

    const m = (root as any).line;
    let model = new Line().with({ guid });

    if (m['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(m['@id']) });
    }
    if (m['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(m['@title']) });
    }
    model = model.with({ speaker: m['@speaker'] });

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'material':
          model = model.with({
            material: Material.fromPersistence(item, ''),
          });
          break;
        case 'translation':
          model = model.with({
            translations: model.translations.set(id, Translation.fromPersistence(item, id)),
          });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence(): Object {

    const children = [
      this.material.toPersistence(),
      ...this.translations.toArray().map(t => t.toPersistence()),
    ];

    const m = {
      line: {
        '@speaker': this.speaker,
        '#array': children,
      },
    };

    this.id.lift(id => m.line['@id'] = id);
    this.title.lift(title => m.line['@title'] = title);

    return m;
  }
}
