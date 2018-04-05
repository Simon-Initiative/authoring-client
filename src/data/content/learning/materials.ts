import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Material } from './material';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils//guid';
import { Orientation } from 'data/content/learning/common';

export type MaterialsParams = {
  content?: Immutable.OrderedMap<string, Material>,
  id?: Maybe<string>,
  title?: Maybe<string>,
  orient?: Orientation,
  guid?: string,
};

const defaultContent = {
  contentType: 'Materials',
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  content: Immutable.OrderedMap<string, Material>(),
  orient: Orientation.Horizontal,
  guid: '',
};

export class Materials extends Immutable.Record(defaultContent) {

  contentType: 'Materials';
  content: Immutable.OrderedMap<string, Material>;
  id: Maybe<string>;
  title: Maybe<string>;
  orient: Orientation;
  guid: string;

  constructor(params?: MaterialsParams) {
    super(augment(params));
  }

  with(values: MaterialsParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      content: this.content.map(c => c.clone().with({ guid: createGuid() })).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Materials {

    const m = (root as any).materials;
    let model = new Materials().with({ guid });

    if (m['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(m['@id']) });
    }
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
            model.content.set(id, Material.fromPersistence(item, id)) });
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
        '@orient': 'horizontal',
        '#array': content,
      },
    };

    this.id.lift(id => m.materials['@id'] = id);
    this.title.lift(title => m.materials['@title'] = title);

    return m;
  }
}
