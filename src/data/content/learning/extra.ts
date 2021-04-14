import * as Immutable from 'immutable';
import { Meaning } from 'data/content/learning/meaning';
import { Anchor } from 'data/content/learning/anchor';
import { augment, getChildren, except, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/common';
import { ContentElements, EXTRA_ELEMENTS } from 'data/content/common/elements';
import createGuid from 'utils/guid';
import { Pronunciation } from 'data/content/learning/pronunciation';
import { Translation } from 'data/content/learning/translation';

export type ExtraParams = {
  anchor?: Anchor;
  pronunciation?: Pronunciation;
  translation?: Translation;
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
  pronunciation: new Pronunciation(),
  translation: new Translation(),
  meaning: Immutable.OrderedMap<string, Meaning>(),
  content: new ContentElements().with({ supportedElements: Immutable.List(EXTRA_ELEMENTS) }),
  guid: '',
};


export class Extra extends Immutable.Record(defaultContent) {

  contentType: 'Extra';
  elementType: 'extra';
  anchor: Anchor;
  pronunciation: Pronunciation;
  translation: Translation;
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
      meaning: this.meaning.mapEntries(([_, v]) => {
        const clone: Meaning = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Meaning>,
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
            Pronunciation.fromPersistence(
              (item as any), '', () => {}),
          });
          break;
        case 'translation':
          model = model.with({ translation:
            Translation.fromPersistence(
              (item as any), '', () => {}),
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
    return this.meaning.size > 0;
  }

  toPersistence() : Object {
    const children : any = [this.anchor.toPersistence()];

    let content = [];

    if (!this.isDefinition()) {
      content = this.content.content.size === 0
      ? [{ p: { '#text': 'Placeholder' } }]
      : this.content.toPersistence();

      let hasContent : boolean = false;
      (content as Object[]).forEach((c) => {
        if ((c['p']['#array']).length > 0) {
          hasContent = true;
          children.push(c);
        }
        return;
      });

      if (!hasContent) {
        const pronunciation = this.pronunciation.toPersistence();
        if (pronunciation['pronunciation']['@src']) {
          children.push(pronunciation);
        }

        const translation = this.translation.toPersistence();
        if ((translation['translation']['#array']).length > 0) {
          children.push(translation);
        }
      }
    } else {

      const pronunciation = this.pronunciation.toPersistence();
      if (pronunciation['pronunciation']['@src']) {
        children.push(pronunciation);
      }

      const translation = this.translation.toPersistence();
      if ((translation['translation']['#array']).length > 0) {
        children.push(translation);
      }

      this.meaning.toArray().forEach(m => children.push(m.toPersistence()));
    }

    const m = {
      extra: {
        '@id': this.id ? this.id : createGuid(),
        '#array': children,
      },
    };

    return m;
  }
}
