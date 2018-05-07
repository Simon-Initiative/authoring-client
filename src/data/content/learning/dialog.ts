import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from './title';
import { Pronunciation } from './pronunciation';
import { Translation } from './translation';
import { Meaning } from './meaning';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils/guid';
import { MediaItem } from 'data/contentTypes';

export type DialogParams = {
  guid?: string,
  id?: Maybe<string>,

  title?: Maybe<Title>;

  mediaItem?: Maybe<MediaItem>;
  speaker?: Immutable.OrderedMap<string, Speaker>;
  line?: Immutable.OrderedMap<string, Line>;
};

const defaultContent = {
  contentType: 'Dialog',
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  term: '',
  pronunciation: Maybe.nothing(),
  translation: Immutable.OrderedMap<string, Translation>(),
  meaning: Immutable.OrderedMap<string, Meaning>(),
  guid: '',
};

export class Dialog extends Immutable.Record(defaultContent) {

  contentType: 'Dialog';
  title: Maybe<Title>;
  term: string;
  pronunciation: Maybe<Pronunciation>;
  translation: Immutable.OrderedMap<string, Translation>;
  meaning: Immutable.OrderedMap<string, Meaning>;
  id: Maybe<string>;
  guid: string;

  constructor(params?: DialogParams) {
    super(augment(params));
  }

  with(values: DialogParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      pronunciation: this.pronunciation.caseOf({
        just: p => Maybe.just(p.clone().with({ guid: createGuid() })),
        nothing: () => Maybe.nothing<Pronunciation>(),
      }),
      translation: this.translation.map(t => t.clone().with({ guid: createGuid() })).toOrderedMap(),
      meaning: this.meaning.map(m => m.clone().with({ guid: createGuid() })).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Dialog {

    const m = (root as any).Dialog;
    let model = new Dialog().with({ guid });

    if (m['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(m['@id']) });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'title':
          model = model.with({ title:
            Maybe.just(Title.fromPersistence(item, id)) });
          break;
        case 'term':
          model = model.with({ term: item['term']['#text'] });
          break;
        case 'pronunciation':
          model = model.with({ pronunciation:
            Maybe.just(Pronunciation.fromPersistence(item, id)) });
          break;
        case 'translation':
          model = model.with({ translation:
            model.translation.set(id, Translation.fromPersistence(item, id)) });
          break;
        case 'meaning':
          model = model.with({ meaning:
            model.meaning.set(id, Meaning.fromPersistence(item, id)) });
          break;
        default:
      }
    });
    return model;
  }

  toPersistence() : Object {
    const children : any = [];
    this.title.lift(t => children.push(t.toPersistence()));
    children.push({ term: { '#text': this.term } });
    this.pronunciation.lift(p => children.push(p.toPersistence()));
    this.translation.toArray().map(t => children.push(t.toPersistence()));
    this.meaning.toArray().forEach(t => children.push(t.toPersistence()));

    const m = {
      Dialog: {
        '#array': children,
      },
    };

    this.id.lift(id => m.Dialog['@id'] = id);

    return m;
  }
}
