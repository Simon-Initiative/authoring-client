import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Translation } from './translation';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils//guid';
import { ContentElements, MATERIAL_ELEMENTS } from 'data/content/common/elements';
import { Speaker } from 'data/content/learning/speaker';

export type LineParams = {
  guid?: string,
  id?: Maybe<string>,
  title?: Maybe<string>,
  speaker?: Speaker,
  material?: ContentElements,
  // Is this right for translation? It looks like it can be 0 or more
  translations?: Immutable.OrderedMap<string, Translation>,
};

const defaultContent = {
  contentType: 'Line',
  guid: '',
  id: Maybe.nothing<string>(),
  title: Maybe.nothing<string>(),
  speaker: new Speaker(),
  material: new ContentElements().with({ supportedElements: Immutable.List(MATERIAL_ELEMENTS) }),
  translations: Immutable.OrderedMap(),
};

export class Line extends Immutable.Record(defaultContent) {

  contentType: 'Line';
  guid?: string;
  id?: Maybe<string>;
  title?: Maybe<string>;
  speaker?: Speaker;
  material?: ContentElements;
  translations?: Immutable.OrderedMap<string, Translation>;

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
      // does translation need to be cloned?
    });
  }

  static fromPersistence(root: Object, guid: string) : Line {

    const m = (root as any).line;
    let model = new Line().with({ guid });

    if (m['@id'] !== undefined) {
      model = model.with({ id: m['@id'] });
    }
    if (m['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(m['@title']) });
    }
    // Is this line right?
    model = model.with({ speaker: Speaker.fromPersistence(m['@speaker'], '') });

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'material':
          model = model.with({
            material: ContentElements.fromPersistence(item, '', MATERIAL_ELEMENTS),
          });
          break;
        case 'translation':
          model = model.with({
            // How to do fromPersistence with the map?
            // Not sure what the translation object looks like from the server
            translations: model.translations.set(id, Translation.fromPersistence(item, '')),
          });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence() : Object {

    const m = {
      line: {
        '@speaker': this.speaker.toPersistence(),
        material: this.material.toPersistence(),
        translations: this.translations.toArray().map(t => t.toPersistence()),
      },
    };

    this.id.lift(id => m.line['@id'] = id);
    this.title.lift(title => m.line['@title'] = title);

    return m;
  }
}
