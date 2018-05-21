import * as Immutable from 'immutable';

import { defaultIdGuid, getChildren } from '../common';
import { getKey } from '../../common';
import { Maybe } from 'tsmonad';
import { Preconditions } from './preconditions';
import { Supplements } from './supplements';
import { Unordered } from './unordered';
import { Item } from './item';
import { createPlaceholderItem } from './common';

import createGuid from '../../../utils/guid';

import * as types from './types';

export type SectionParams = {
  id?: string,
  title?: string,
  description?: Maybe<string>,
  metadata?: Maybe<Object>,
  preconditions?: Maybe<Preconditions>,
  supplements?: Maybe<Supplements>,
  children?: Immutable.OrderedMap<string, Section | Item>,
  unordered?: Maybe<Unordered>,
  progressConstraintIdref?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Section,
  elementType: 'section',
  id: '',
  title: '',
  description: Maybe.nothing<string>(),
  metadata: Maybe.nothing<Object>(),
  preconditions: Maybe.nothing<Preconditions>(),
  supplements: Maybe.nothing<Supplements>(),
  children: Immutable.OrderedMap<string, Section | Item>(),
  unordered: Maybe.nothing<Unordered>(),
  progressConstraintIdref: Maybe.nothing<string>(),
  guid: '',
};

export class Section extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Section;
  elementType: 'section';
  id: string;
  title: string;
  description: Maybe<string>;
  metadata: Maybe<Object>;
  preconditions: Maybe<Preconditions>;
  supplements: Maybe<Supplements>;
  children: Immutable.OrderedMap<string, Section | Item>;
  unordered: Maybe<Unordered>;
  progressConstraintIdref: Maybe<string>;
  guid: string;

  constructor(params?: SectionParams) {
    super(defaultIdGuid(params));
  }

  with(values: SectionParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).section;
    let model = new Section({ guid });

    if (s['@id'] !== undefined) {
      model = model.with({ id: s['@id'] });
    }
    if (s['@progress_constraint_idref'] !== undefined) {
      model = model.with({ progressConstraintIdref: Maybe.just(s['@progress_constraint_idref']) });
    }

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'metadata:metadata':
          model = model.with({ metadata: Maybe.just(item) });
          break;
        case 'preconditions':
          model = model.with(
            { preconditions: Maybe.just(Preconditions.fromPersistence(item, id)) });
          break;
        case 'unordered':
          model = model.with(
            { unordered: Maybe.just(Unordered.fromPersistence(item, id)) });
          break;
        case 'section':
          model = model.with(
            { children: model.children.set(id, Section.fromPersistence(item, id)) });
          break;
        case 'item':
          model = model.with(
            { children: model.children.set(id, Item.fromPersistence(item, id)) });
          break;
        case 'supplements':
          model = model.with(
            { supplements: Maybe.just(Supplements.fromPersistence(item, id)) });
          break;
        case 'title':
          model = model.with(
            { title: item['title']['#text'] });
          break;
        case 'description':
          model = model.with(
            { description: Maybe.just(item['description']['#text']) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const children : Object[] = [{ title: { '#text': this.title } }];

    this.description.lift(p => children.push(({ description: { '#text': p } } as any)));
    this.metadata.lift(p => children.push(p));
    this.preconditions.lift(p => children.push(p.toPersistence()));
    this.supplements.lift(p => children.push(p.toPersistence()));

    if (this.children.size === 0) {
      children.push(createPlaceholderItem().toPersistence());
    } else {
      this.children.toArray().forEach(c => children.push(c.toPersistence()));
    }

    this.unordered.lift(p => children.push(p.toPersistence()));

    const s = {
      section: {
        '@id': this.id,
        '#array': children,
      },
    };

    this.progressConstraintIdref.lift(p => s.section['@progress_constraint_idref'] = p);

    return s;
  }
}
