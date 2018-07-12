import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Meaning } from 'data/content/learning/meaning';
import { Anchor } from 'data/content/learning/anchor';
import { augment, getChildren, except } from 'data/content/common';
import { getKey } from 'data/common';
import { ContentElements, EXTRA_ELEMENTS } from 'data/content/common/elements';

import createGuid from 'utils/guid';
import { ContiguousText } from 'data/contentTypes';
import { ContiguousTextMode } from 'data/content/learning/contiguous';

export type ExtraParams = {
  anchor?: Anchor;
  pronunciation?: ContiguousText;
  translation?: ContiguousText;
  meaning?: Immutable.OrderedMap<string, Meaning>;
  content?: ContentElements,
  id?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Extra',
  elementType: 'extra',
  id: Maybe.nothing(),
  anchor: new Anchor(),
  pronunciation: ContiguousText.fromText('', '', ContiguousTextMode.SimpleText),
  translation: ContiguousText.fromText('', '', ContiguousTextMode.SimpleText),
  meaning: Immutable.OrderedMap<string, Meaning>(),
  content: new ContentElements().with({ supportedElements: Immutable.List(EXTRA_ELEMENTS) }),
  guid: '',
};


export class Extra extends Immutable.Record(defaultContent) {

  contentType: 'Extra';
  elementType: 'extra';
  anchor: Anchor;
  pronunciation: ContiguousText;
  translation: ContiguousText;
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
            ContiguousText.fromPersistence(
              (item as any).pronunciation, '', ContiguousTextMode.SimpleText),
          });
          break;
        case 'translation':
          model = model.with({ translation:
            ContiguousText.fromPersistence(
              (item as any).translation, '', ContiguousTextMode.SimpleText),
          });
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

    const hasPronunciation = this.pronunciation.extractPlainText().caseOf(
      { just: p => p !== '', nothing: () => false });
    const hasTranslation = this.translation.extractPlainText().caseOf(
      { just: p => p !== '', nothing: () => false });

    return hasPronunciation || hasTranslation || this.meaning.size > 0;
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

    const hasPronunciation = this.pronunciation.extractPlainText().caseOf(
      { just: p => p !== '', nothing: () => false });
    const hasTranslation = this.translation.extractPlainText().caseOf(
      { just: p => p !== '', nothing: () => false });

    if (hasPronunciation) {
      const o = {};
      o['#array'] = this.pronunciation.toPersistence();
      children.push({ pronunciation: o });
    }
    if (hasTranslation) {
      const o = {};
      o['#array'] = this.translation.toPersistence();
      children.push({ translation: o });
    }

    this.meaning.toArray().forEach(m => children.push(m.toPersistence()));

    const m = {
      extra: {
        '#array': children,
      },
    };

    this.id.lift(id => m.extra['@id'] = id);

    return m;
  }
}
