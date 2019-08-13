import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Image } from 'data/content/learning/image';
import { augment, ensureIdGuidPresent, setId, getChildren } from 'data/content/common';
import createGuid from 'utils/guid';
import { getKey } from 'data/content/learning/common';

export type SpeakerParams = {
  guid?: string,
  id?: string,
  title?: Maybe<string>,
  content?: Immutable.Map<string, string | Maybe<Image>>;
};

const defaultContent = {
  contentType: 'Speaker',
  elementType: 'speaker',
  guid: '',
  id: '',
  // Currently no way to edit title, but it doesn't seem to be used
  title: Maybe.nothing<string>(),
  // The speaker name appears as a text child of the <Speaker> element. It can
  // optionally have an image as well which must appear as the first child.
  content: Immutable.Map()
    .set('image', Maybe.nothing<Image>())
    .set('name', 'Speaker Name'),
};

export class Speaker extends Immutable.Record(defaultContent) {

  contentType: 'Speaker';
  elementType: 'speaker';
  guid: string;
  id: string;
  title: Maybe<string>;
  content: Immutable.Map<string, string | Maybe<Image>>;

  constructor(params?: SpeakerParams) {
    super(augment(params, true));
  }

  with(values: SpeakerParams) {
    return this.merge(values) as this;
  }

  clone(): Speaker {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Speaker {

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
        case 'image':
          const image = Image.fromPersistence(item, id, notify);
          model = model.with({
            content: model.content.set('image', Maybe.just(image)),
          });
          break;
        default:
          model = model.with({
            content: model.content.set('name', item['#text'] ? item['#text'] : item as string),
          });
      }
    });

    return model;
  }

  toPersistence(): Object {

    const content = {};
    (this.content.get('image') as Maybe<Image>).caseOf({
      just: (image) => {
        content['#array'] = [
          image.toPersistence(),
          this.content.get('name'),
        ];
        return;
      },
      nothing: () => {
        content['#text'] = this.content.get('name');
        return;
      },
    });

    const m = {
      speaker: {
        '@id': this.id ? this.id : createGuid(),
        ...content,
      },
    };

    this.title.lift(title => m.speaker['@title'] = title);

    return m;
  }
}
