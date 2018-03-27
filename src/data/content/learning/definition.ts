import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from './title';
import { Pronunciation } from './pronunciation';
import { Translation } from './translation';
import { Meaning } from './meaning';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import createGuid from 'utils//guid';

export type DefinitionParams = {
  title?: Maybe<Title>;
  term?: string;
  pronunciation?: Maybe<Pronunciation>;
  translation?: Immutable.OrderedMap<string, Translation>;
  meaning?: Immutable.OrderedMap<string, Meaning>;
  id?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Definition',
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  term: '',
  pronunciation: Maybe.nothing(),
  translation: Immutable.OrderedMap<string, Translation>(),
  meaning: Immutable.OrderedMap<string, Meaning>(),
  guid: '',
};

export class Definition extends Immutable.Record(defaultContent) {

  contentType: 'Definition';
  title: Maybe<Title>;
  term: string;
  pronunciation: Maybe<Pronunciation>;
  translation: Immutable.OrderedMap<string, Translation>;
  meaning: Immutable.OrderedMap<string, Meaning>;
  id: Maybe<string>;
  guid: string;

  constructor(params?: DefinitionParams) {
    super(augment(params));
  }

  with(values: DefinitionParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      pronunciation: this.pronunciation.caseOf({
        just: p => Maybe.just(p.clone()),
        nothing: () => Maybe.nothing<Pronunciation>(),
      }),
      translation: this.translation.map(t => t.clone()).toOrderedMap(),
      meaning: this.meaning.map(m => m.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Definition {

    const m = (root as any).definition;
    let model = new Definition().with({ guid });

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
      definition: {
        '#array': children,
      },
    };

    this.id.lift(id => m.definition['@id'] = id);

    return m;
  }
}
