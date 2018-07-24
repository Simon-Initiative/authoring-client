import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Translation } from 'data/content/learning/translation';
import { augment, getChildren, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { Material } from 'data/content/learning/material';

export type LineParams = {
  guid?: string,
  id?: string,
  title?: Maybe<string>,
  speaker?: string,
  material?: Material,
  translations?: Immutable.OrderedMap<string, Translation>,
};

const defaultContent = {
  contentType: 'Line',
  elementType: 'line',
  guid: '',
  id: '',
  title: Maybe.nothing<string>(),
  speaker: '',
  material: new Material(),
  translations: Immutable.OrderedMap<string, Translation>(),
};

export class Line extends Immutable.Record(defaultContent) {

  contentType: 'Line';
  elementType: 'line';
  guid: string;
  id: string;
  title: Maybe<string>;
  speaker: '';
  material: Material;
  translations: Immutable.OrderedMap<string, Translation>;

  constructor(params?: LineParams) {
    super(augment(params, true));
  }

  with(values: LineParams) {
    return this.merge(values) as this;
  }

  clone(): Line {
    return ensureIdGuidPresent(this.with({
      material: this.material.clone(),
      translations: this.translations.mapEntries(([_, v]) => {
        const clone: Translation = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Translation>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Line {

    const m = (root as any).line;
    let model = new Line().with({ guid });

    model = setId(model, m, notify);

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
            material: Material.fromPersistence(item, '', notify),
          });
          break;
        case 'translation':
          model = model.with({
            translations: model.translations.set(id, Translation.fromPersistence(item, id, notify)),
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
        '@id': this.id ? this.id : createGuid(),
        '@speaker': this.speaker,
        '#array': children,
      },
    };

    this.title.lift(title => m.line['@title'] = title);

    return m;
  }
}
