import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Pronunciation } from './pronunciation';
import { Translation } from './translation';
import { Meaning } from './meaning';
import { Anchor } from './anchor';
import { augment, getChildren, except } from '../common';
import { getKey } from '../../common';
import { ContentElements, EXTRA_ELEMENTS } from 'data/content/common/elements';

import createGuid from 'utils/guid';

export type ExtraParams = {
  anchor?: Anchor;
  pronunciation?: Maybe<Pronunciation>;
  translation?: Maybe<Translation>;
  meaning?: Immutable.OrderedMap<string, Meaning>;
  content?: ContentElements,
  id?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Extra',
  id: Maybe.nothing(),
  anchor: new Anchor(),
  pronunciation: Maybe.nothing(),
  translation: Maybe.nothing(),
  meaning: Immutable.OrderedMap<string, Meaning>(),
  content: new ContentElements().with({ supportedElements: Immutable.List(EXTRA_ELEMENTS) }),
  guid: '',
};

export class Extra extends Immutable.Record(defaultContent) {

  contentType: 'Extra';
  anchor: Anchor;
  pronunciation: Maybe<Pronunciation>;
  translation: Maybe<Translation>;
  meaning: Immutable.OrderedMap<string, Meaning>;
  content: ContentElements;
  id: Maybe<string>;
  guid: string;

  constructor(params?: ExtraParams) {
    super(augment(params));
  }

  with(values: ExtraParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      anchor: this.anchor.clone(),
      pronunciation: this.pronunciation.caseOf({
        just: p => Maybe.just(p.clone().with({ guid: createGuid() })),
        nothing: () => Maybe.nothing<Pronunciation>(),
      }),
      translation: this.translation.caseOf({
        just: p => Maybe.just(p.clone().with({ guid: createGuid() })),
        nothing: () => Maybe.nothing<Translation>(),
      }),
      meaning: this.meaning.map(m => m.clone().with({ guid: createGuid() })).toOrderedMap(),
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Extra {

    const m = (root as any).extra;
    let model = new Extra().with({ guid });

    if (m['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(m['@id']) });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'anchor':
          model = model.with({ anchor: Anchor.fromPersistence(item, '') });
          break;
        case 'pronunciation':
          model = model.with({ pronunciation:
            Maybe.just(Pronunciation.fromPersistence(item, id)) });
          break;
        case 'translation':
          model = model.with({ translation:
            Maybe.just(Translation.fromPersistence(item, id)) });
          break;
        case 'meaning':
          model = model.with({ meaning:
            model.meaning.set(id, Meaning.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    model = model.with({ content: ContentElements
      .fromPersistence(
        except(getChildren(m), 'anchor', 'pronunciation', 'translation', 'meaning'),
        '',
        EXTRA_ELEMENTS) });

    return model;
  }

  isDefinition() : boolean {
    return this.translation.caseOf({ just: t => true, nothing: () => false })
      || this.pronunciation.caseOf({ just: t => true, nothing: () => false })
      || this.meaning.size > 0;
  }

  toPersistence() : Object {
    const children : any = [this.anchor.toPersistence()];

    let content = [];

    if (!this.isDefinition()) {
      content = this.content.content.size === 0
      ? [{ p: { '#text': 'Placeholder' } }]
      : this.content.toPersistence();
    }

    (content as Object[]).forEach(c => children.push(c));

    this.pronunciation.lift(p => children.push(p.toPersistence()));
    this.translation.lift(p => children.push(p.toPersistence()));
    this.meaning.toArray().forEach(t => children.push(t.toPersistence()));

    const m = {
      extra: {
        '#array': children,
      },
    };

    this.id.lift(id => m.extra['@id'] = id);

    return m;
  }
}
