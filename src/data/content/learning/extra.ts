import * as Immutable from 'immutable';
import { Meaning } from './meaning';
import { Anchor } from './anchor';
import { augment, getChildren, except, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';
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
  id?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Extra',
  elementType: 'extra',
  id: '',
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
  id: string;
  guid: string;

  constructor(params?: ExtraParams) {
    super(augment(params, true));
  }

  with(values: ExtraParams) {
    return this.merge(values) as this;
  }

  clone(): Extra {
    return ensureIdGuidPresent(this.with({
      pronunciation: this.pronunciation.clone(),
      translation: this.translation.clone(),
      anchor: this.anchor.clone(),
      meaning: this.meaning.map(m => m.clone()).toOrderedMap(),
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Extra {

    const m = (root as any).extra;
    let model = new Extra().with({ guid });

    if (m['@id']) {
      model = model.with({ id: m['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'anchor':
          model = model.with({ anchor: Anchor.fromPersistence(item, '', notify) });
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
            model.meaning.set(id, Meaning.fromPersistence(item, id, notify)) });
          break;
        default:
      }
    });

    model = model.with({ content: ContentElements
      .fromPersistence(
        except(getChildren(m), 'anchor', 'pronunciation', 'translation', 'meaning'),
        '',
        EXTRA_ELEMENTS, null, notify) });

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
        '@id': this.id ? this.id : createGuid(),
        '#array': children,
      },
    };

    return m;
  }
}
