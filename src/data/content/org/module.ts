import * as Immutable from 'immutable';

import { defaultIdGuid, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { Maybe } from 'tsmonad';
import { Preconditions } from 'data/content/org/preconditions';
import { Supplements } from 'data/content/org/supplements';
import { Dependencies } from 'data/content/org/dependencies';
import { Unordered } from 'data/content/org/unordered';
import { Item } from 'data/content/org/item';
import { Section } from 'data/content/org/section';
import { Include } from 'data/content/org/include';
import { createPlaceholderItem, PLACEHOLDER_ITEM_ID } from 'data/content/org/common';

import createGuid from 'utils/guid';

import * as types from 'data/content/org/types';

export type ModuleParams = {
  id?: string,
  title?: string,
  description?: Maybe<string>,
  metadata?: Maybe<Object>,
  dependencies?: Maybe<Dependencies>
  preconditions?: Maybe<Preconditions>,
  supplements?: Maybe<Supplements>,
  children?: Immutable.OrderedMap<string, Section | Include | Item>,
  unordered?: Maybe<Unordered>,
  progressConstraintIdref?: Maybe<string>,
  duration?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Module,
  elementType: 'module',
  id: '',
  title: '',
  description: Maybe.nothing<string>(),
  metadata: Maybe.nothing<Object>(),
  dependencies: Maybe.nothing<Dependencies>(),
  preconditions: Maybe.nothing<Preconditions>(),
  supplements: Maybe.nothing<Supplements>(),
  children: Immutable.OrderedMap<string, Section | Include | Item>(),
  unordered: Maybe.nothing<Unordered>(),
  progressConstraintIdref: Maybe.nothing<string>(),
  duration: Maybe.nothing<string>(),
  guid: '',
};

export class Module extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Module;
  elementType: 'module';
  id: string;
  title: string;
  description: Maybe<string>;
  metadata: Maybe<Object>;
  dependencies: Maybe<Dependencies>;
  preconditions: Maybe<Preconditions>;
  supplements: Maybe<Supplements>;
  children: Immutable.OrderedMap<string, Section | Include | Item>;
  unordered: Maybe<Unordered>;
  progressConstraintIdref: Maybe<string>;
  duration: Maybe<string>;
  guid: string;

  constructor(params?: ModuleParams) {
    super(defaultIdGuid(params));
  }

  with(values: ModuleParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).module;
    const params = { guid } as any;

    if (s['@id'] !== undefined) {
      params.id = s['@id'];
    }
    if (s['@progress_constraint_idref'] !== undefined) {
      params.progressConstraintIdref = Maybe.just(s['@progress_constraint_idref']);
    }
    if (s['@duration'] !== undefined) {
      params.duration = Maybe.just(s['@duration']);
    }

    const children = [];

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'metadata:metadata':
          params.metadata = Maybe.just(item);
          break;
        case 'dependencies':
          params.dependencies = Maybe.just(Dependencies.fromPersistence(item, id));
          break;
        case 'preconditions':
          params.preconditions = Maybe.just(Preconditions.fromPersistence(item, id));
          break;
        case 'unordered':
          params.unordered = Maybe.just(Unordered.fromPersistence(item, id));
          break;
        case 'section':
          children.push([id, Section.fromPersistence(item, id)]);
          break;
        case 'include':
          children.push([id, Include.fromPersistence(item, id)]);
          break;
        case 'item':
          const candidateItem = Item.fromPersistence(item, id);
          if (candidateItem.resourceref.idref.value() !== PLACEHOLDER_ITEM_ID) {
            children.push([id, Item.fromPersistence(item, id)]);
          }
          break;
        case 'supplements':
          params.supplements = Maybe.just(Supplements.fromPersistence(item, id));
          break;
        case 'title':
          params.title = item['title']['#text'];
          break;
        case 'description':
          params.description = Maybe.just(item['description']['#text']);
          break;
        default:

      }
    });

    params.children = Immutable.OrderedMap<string, any>(children);

    return new Module(params);
  }

  toPersistence(): Object {

    const children: Object[] = [{ title: { '#text': this.title } }];

    this.description.lift(p => children.push(({ description: { '#text': p } } as any)));
    this.metadata.lift(p => children.push(p));
    this.dependencies.lift(p => children.push(p.toPersistence()));
    this.preconditions.lift(p => children.push(p.toPersistence()));
    this.supplements.lift(p => children.push(p.toPersistence()));

    if (this.children.size === 0) {
      children.push(createPlaceholderItem().toPersistence());
    } else {
      this.children.toArray().forEach(c => children.push(c.toPersistence()));
    }

    this.unordered.lift(p => children.push(p.toPersistence()));

    const s = {
      module: {
        '@id': this.id,
        '#array': children,
      },
    };

    this.progressConstraintIdref.lift(p => s.module['@progress_constraint_idref'] = p);
    this.duration.lift(p => s.module['@duration'] = p);

    return s;
  }
}
