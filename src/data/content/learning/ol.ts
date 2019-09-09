import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from 'data/content/learning/title';
import { Li } from 'data/content/learning/li';
import { augment, getChildren, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/content/learning/common';
import createGuid from 'utils/guid';

export enum Styles {
  None = 'none',
  Decimal = 'decimal',
  DecimalLeadingZero = 'decimal-leading-zero',
  LowerRoman = 'lower-roman',
  UpperRoman = 'upper-roman',
  LowerAlpha = 'lower-alpha',
  UpperAlpha = 'upper-alpha',
  LowerLatin = 'lower-latin',
  UpperLatin = 'upper-latin',
}

export type OlParams = {
  id?: string,
  title?: Maybe<Title>,
  style?: Maybe<Styles>,
  start?: Maybe<string>,
  listItems?: Immutable.OrderedMap<string, Li>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Ol',
  elementType: 'ol',
  id: '',
  style: Maybe.nothing(),
  start: Maybe.nothing(),
  title: Maybe.nothing(),
  listItems: Immutable.OrderedMap<string, Li>(),
  guid: '',
};

export class Ol extends Immutable.Record(defaultContent) {

  contentType: 'Ol';
  elementType: 'ol';
  id: string;
  title: Maybe<Title>;
  style: Maybe<Styles>;
  start: Maybe<string>;
  listItems: Immutable.OrderedMap<string, Li>;
  guid: string;

  constructor(params?: OlParams) {
    super(augment(params, true));
  }

  with(values: OlParams) {
    return this.merge(values) as this;
  }

  clone(): Ol {
    return ensureIdGuidPresent(this.with({
      title: this.title.lift(t => t.clone()),
      listItems: this.listItems.mapEntries(([_, v]) => {
        const clone: Li = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Li>,
    }));
  }

  static fromPersistence(
    root: Object, guid: string, notify: () => void, backingTextProvider: Object = null): Ol {

    const t = (root as any).ol;

    let model = new Ol().with({ guid });

    if (t['@id']) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }

    if (t['@style'] !== undefined) {
      model = model.with({ style: Maybe.just(t['@style']) });
    }
    if (t['@start'] !== undefined) {
      model = model.with({ start: Maybe.just(t['@start']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(Title.fromPersistence(item, id, notify)) });
          break;
        case 'li':
          model = model.with({
            listItems: model.listItems.set(
              id, Li.fromPersistence(item, id, notify, backingTextProvider)),
          });
          break;

        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    const children = [];
    this.title.lift(title => children.push(title.toPersistence()));
    this.listItems.toArray().forEach(t => children.push(t.toPersistence()));

    const ol = {
      ol: {
        '@id': this.id ? this.id : createGuid(),
        '#array': children,
      },
    };

    this.style.lift(value => ol.ol['@style'] = value);
    this.start.lift(value => ol.ol['@start'] = value);

    return ol;
  }
}
