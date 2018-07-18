import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from './title';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils/guid';
import { IFrame } from 'data/content/learning/iframe';
import { YouTube } from 'data/content/learning/youtube';
import { Image } from 'data/content/learning/image';
import { Video } from 'data/content/learning/video';
import { Audio } from 'data/content/learning/audio';
import { Speaker } from 'data/content/learning/speaker';
import { Line } from 'data/content/learning/line';
import { MediaItem } from 'data/contentTypes';

export type DialogParams = {
  guid?: string,
  id?: string,
  title?: Title,
  media?: Maybe<MediaItem>,
  speakers?: Immutable.OrderedMap<string, Speaker>,
  lines?: Immutable.OrderedMap<string, Line>,
};

const defaultContent = {
  contentType: 'Dialog',
  elementType: 'dialog',
  guid: '',
  id: '',
  title: Title.fromText('Dialog Title'),
  media: Maybe.nothing<MediaItem>(),
  speakers: Immutable.OrderedMap<string, Speaker>(),
  lines: Immutable.OrderedMap<string, Line>(),
};

function withTitles(model: Dialog): Dialog {

  let count = 0;
  const next = () => {
    count += 1;
    return count;
  };

  return model.with({
    speakers: model.speakers.map((speaker) => {
      const defaultTitle = 'Speaker ' + next();
      const title = speaker.title.caseOf({
        just: title => title,
        nothing: () =>
          speaker.content.caseOf({
            just: content =>
              content instanceof String
                ? content as string
                : defaultTitle,
            nothing: () => defaultTitle,
          }),
      });

      return speaker.with({ title: Maybe.just(title) });
    }).toOrderedMap(),
  });
}

export class Dialog extends Immutable.Record(defaultContent) {

  contentType: 'Dialog';
  elementType: 'dialog';
  guid: string;
  id: string;
  title: Title;
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
      id: createGuid(),
      title: this.title.clone(),
      media: this.media.lift(media => media.clone()),
      speakers: this.speakers.map(s => s.clone()).toOrderedMap(),
      lines: this.lines.map(l => l.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string): Dialog {

    const m = (root as any).dialog;
    let model = new Dialog().with({ guid });

    if (m['@id']) {
      model = model.with({ id: m['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }
    if (m['@title'] !== undefined) {
      model = model.with({ title: m['@title'] });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
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
        case 'title':
          model = model.with({
            title: Title.fromPersistence(item, id),
          });
          break;
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
        default:
      }
    });

    return withTitles(model);
  }

  toPersistence(): Object {
    const media = [];
    this.media.lift(m => media.push(m.toPersistence()));

    const m = {
      dialog: {
        '@id': this.id ? this.id : createGuid(),
        '#array': [
          this.title.toPersistence(),
          ...media,
          ...this.speakers.toArray().map(s => s.toPersistence()),
          ...this.lines.toArray().map(l => l.toPersistence()),
        ],
      },
    };

    return m;
  }
}
