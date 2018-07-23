import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Material } from 'data/content/learning/material';
import { augment, getChildren, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { Orientation } from 'data/content/learning/common';

export type MaterialsParams = {
  content?: Immutable.OrderedMap<string, Material>,
  id?: string,
  title?: Maybe<string>,
  orient?: Orientation,
  guid?: string,
};

const defaultContent = {
  contentType: 'Materials',
  elementType: 'materials',
  id: '',
  title: Maybe.nothing(),
  content: Immutable.OrderedMap<string, Material>(),
  orient: Orientation.Horizontal,
  guid: '',
};

export class Materials extends Immutable.Record(defaultContent) {

  contentType: 'Materials';
  elementType: 'materials';
  content: Immutable.OrderedMap<string, Material>;
  id: string;
  title: Maybe<string>;
  orient: Orientation;
  guid: string;

  constructor(params?: MaterialsParams) {
    super(augment(params, true));
  }

  with(values: MaterialsParams) {
    return this.merge(values) as this;
  }

  clone(): Materials {
    return ensureIdGuidPresent(this.with({
      content: this.content.mapEntries(([_, v]) => {
        const clone: Material = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Material>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Materials {

    const m = (root as any).materials;
    let model = new Materials().with({ guid });

    model = setId(model, m, notify);

    if (m['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(m['@title']) });
    }
    if (m['@orient'] !== undefined) {
      model = model.with({ orient:
        m['@orient'] === 'vertical' ? Orientation.Vertical : Orientation.Horizontal });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'material':
          model = model.with({ content:
            model.content.set(id, Material.fromPersistence(item, id, notify)) });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence() : Object {

    // We must enforce the DTD constraint that materials must contain at
    // least two material elements:

    const empty = { material: { p: { '#text': ' ' } } };

    let content: any = [empty, empty];

    if (this.content.size === 1) {
      content = [...this.content.toArray().map(m => m.toPersistence()), empty];
    } else if (this.content.size > 1) {
      content = this.content.toArray().map(m => m.toPersistence());
    }

    const m = {
      materials: {
        '@id': this.id ? this.id : createGuid(),
        '@orient': 'horizontal',
        '#array': content,
      },
    };

    this.title.lift(title => m.materials['@title'] = title);

    return m;
  }
}
