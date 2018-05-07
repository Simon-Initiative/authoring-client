import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from './title';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils/guid';
import { MediaItem, IFrame, YouTube, Image, Video, Audio } from 'data/contentTypes';
import { Speaker } from 'data/content/learning/speaker';
import { Line } from 'data/content/learning/line';

export type DialogParams = {
  guid?: string,
  id?: Maybe<string>,
  title?: Maybe<Title>,
  media?: Maybe<MediaItem>,
  speakers?: Immutable.OrderedMap<string, Speaker>,
  lines?: Immutable.OrderedMap<string, Line>,
};

const defaultContent = {
  contentType: 'Dialog',
  guid: '',
  id: Maybe.nothing<string>(),
  title: Maybe.nothing<Title>(),
  media: Maybe.nothing<MediaItem>(),
  speakers: Immutable.OrderedMap<string, Speaker>(),
  lines: Immutable.OrderedMap<string, Line>(),
};

export class Dialog extends Immutable.Record(defaultContent) {

  contentType: 'Dialog';
  guid: string;
  id: Maybe<string>;
  title: Maybe<Title>;
  media: Maybe<MediaItem>;
  speakers: Immutable.OrderedMap<string, Speaker>;
  lines: Immutable.OrderedMap<string, Line>;

  constructor(params?: DialogParams) {
    super(augment(params));
  }

  with(values: DialogParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      title: this.title.lift(title => title.clone()),
      media: this.media.lift(media => media.clone()),
      speakers: this.speakers.map(s => s.clone()).toOrderedMap(),
      lines: this.lines.map(l => l.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string): Dialog {

    const m = (root as any).dialog;
    let model = new Dialog().with({ guid });

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

        // Switch for each type of MediaItem
        case 'audio':
          model = model.with({
            media: Maybe.just(Audio.fromPersistence(item, id)),
          });
          break;
        case 'image':
          model = model.with({
            media: Maybe.just(Image.fromPersistence(item, id)),
          });
          break;
        case 'video':
          model = model.with({
            media: Maybe.just(Video.fromPersistence(item, id)),
          });
          break;
        case 'youtube':
          model = model.with({
            media: Maybe.just(YouTube.fromPersistence(item, id)),
          });
          break;
        case 'iframe':
          model = model.with({
            media: Maybe.just(IFrame.fromPersistence(item, id)),
          });
          break;

        case 'speaker':
          model = model.with({
            speakers: model.speakers.set(id, Speaker.fromPersistence(item, id)),
          });
          break;
        case 'line':
          model = model.with({
            lines: model.lines.set(id, Line.fromPersistence(item, id)),
          });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence(): Object {
    const children = [
      ...this.speakers.toArray().map(s => s.toPersistence()),
      ...this.lines.toArray().map(l => l.toPersistence()),
    ];

    this.media.lift(m => children.push(m.toPersistence()));

    const m = {
      dialog: {
        '#array': children,
      },
    };

    this.id.lift(id => m.dialog['@id'] = id);
    this.title.lift(t => m.dialog['@title'] = t.toPersistence());

    return m;
  }
}
