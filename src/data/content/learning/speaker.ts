import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Image } from 'data/content/learning/image';
import { augment, getChildren, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';

export type SpeakerParams = {
  guid?: string,
  id?: string,
  title?: Maybe<string>,
  content?: Maybe<string | Image>;
};

const defaultContent = {
  contentType: 'Speaker',
  elementType: 'speaker',
  guid: '',
  id: '',
  title: Maybe.nothing<string>(),
  content: Maybe.nothing<string | Image>(),
};

export class Speaker extends Immutable.Record(defaultContent) {

  contentType: 'Speaker';
  elementType: 'speaker';
  guid: string;
  id: string;
  title: Maybe<string>;
  content: Maybe<string | Image>;

  constructor(params?: SpeakerParams) {
    super(augment(params, true));
  }

  with(values: SpeakerParams) {
    return this.merge(values) as this;
  }

  clone(): Speaker {
    return ensureIdGuidPresent(this.with({
      content: this.content.lift(c => typeof c === 'string' ? c : c.clone()),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Speaker {

    const m = (root as any).speaker;
    let model = new Speaker().with({ guid });

    model = setId(model, m, notify);

    if (m['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(m['@title']) });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case '#text':
          model = model.with({ content: Maybe.just(item.toString()) });
          break;
        case 'image':
          model = model.with({ content: Maybe.just(Image.fromPersistence(item, id, notify)) });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence() : Object {
    const m = {
      speaker: {
        '@id': this.id ? this.id : createGuid(),
      },
    };

    this.title.lift(title => m.speaker['@title'] = title);
    this.content.lift((content) => {
      if (content instanceof String) {
        m.speaker['#text'] = content;
      } else if (content instanceof Image) {
        const image = (content.toPersistence() as any).image;
        m.speaker['image'] = image;
      }
    });

    return m;
  }
}
