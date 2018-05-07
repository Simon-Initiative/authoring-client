import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Image } from './image';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils//guid';

export type SpeakerParams = {
  guid?: string,
  id?: string,
  title?: Maybe<string>, // redundant with name?
  name?: Maybe<string>;
  image?: Maybe<Image>,
};

const defaultContent = {
  contentType: 'Speaker',
  guid: '',
  id: '',
  title: Maybe.nothing<string>(),
  name: Maybe.nothing<string>(),
  image: Maybe.nothing<Image>(),
};

export class Speaker extends Immutable.Record(defaultContent) {

  contentType: 'Speaker';
  guid?: string;
  id?: string;
  title?: Maybe<string>;
  name?: Maybe<string>;
  image?: Maybe<Image>;

  constructor(params?: SpeakerParams) {
    super(augment(params));
  }

  with(values: SpeakerParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      guid: createGuid(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Speaker {

    const m = (root as any).speaker;
    let model = new Speaker().with({ guid });

    if (m['@id'] !== undefined) {
      model = model.with({ id: m['@id'] });
    }
    if (m['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(m['@title']) });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case '#text':
          // What is the right way to do this? Switchong on '#text' doesn't seem right,
          // and how to assign to { name } ?
          model = model.with({ name: Maybe.just<string>(item.toString()) });
          break;
        case 'image':
          model = model.with({ image: Maybe.just(Image.fromPersistence(item, id)) });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence() : Object {
    const m = {
      speaker: {
        '@id': this.id,
      },
    };

    this.title.lift(title => m.speaker['@title'] = title);
    this.name.lift(name => m.speaker['name'] = name);
    this.image.lift(image => m.speaker['image'] = image.toPersistence);

    return m;
  }
}
