import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Maybe } from 'tsmonad';
import { ResourceRef } from './resourceref';
import { Preconditions } from './preconditions';
import { Supplements } from './supplements';
import { Dependencies } from './dependencies';
import { Schedule } from './schedule';
import { Unordered } from './unordered';
import { Item } from './item';
import { Section } from './section';
import { Module } from './module';
import { Include } from './include';
import createGuid from '../../../utils/guid';

import * as types from './types';

export type SequenceParams = {
  id?: string,
  title?: string,
  description?: Maybe<string>,
  metadata?: Maybe<Object>,
  dependencies?: Maybe<Dependencies>
  preconditions?: Maybe<Preconditions>,
  supplements?: Maybe<Supplements>,
  children?: Immutable.OrderedMap<string, Module | Include | Item>,
  unordered?: Maybe<Unordered>,
  progressConstraintIdref?: Maybe<string>,
  category?: types.CategoryTypes,
  audience?: types.AudienceTypes,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Sequence,
  id: '',
  title: '',
  description: Maybe.nothing<string>(),
  metadata: Maybe.nothing<Object>(),
  dependences: Maybe.nothing<Dependencies>(),
  preconditions: Maybe.nothing<Preconditions>(),
  supplements: Maybe.nothing<Supplements>(),
  children: Immutable.OrderedMap<string, Module | Include | Item>(),
  unordered: Maybe.nothing<Unordered>(),
  progressConstraintIdref: Maybe.nothing<string>(),
  duration: Maybe.nothing<string>(),
  category: types.CategoryTypes.Content,
  audience: types.AudienceTypes.All,
  guid: '',
};

export class Sequence extends Immutable.Record(defaultContent) {
  
  contentType: types.ContentTypes.Sequence;
  id: string;
  title: string;
  description: Maybe<string>;
  metadata: Maybe<Object>;
  dependencies: Maybe<Dependencies>;
  preconditions: Maybe<Preconditions>;
  supplements: Maybe<Supplements>;
  children: Immutable.OrderedMap<string, Module | Include | Item>;
  unordered: Maybe<Unordered>;
  progressConstraintIdref: Maybe<string>;
  duration: Maybe<string>;
  category: types.CategoryTypes;
  audience: types.AudienceTypes;
  guid: string;
  
  constructor(params?: SequenceParams) {
    super(augment(params));
  }

  with(values: SequenceParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).sequence;
    let model = new Sequence({ guid });

    if (s['@id'] !== undefined) {
      model = model.with({ id: s['@id'] });
    }
    if (s['@progress_constraint_idref'] !== undefined) {
      model = model.with({ progressConstraintIdref: Maybe.just(s['@progress_constraint_idref']) });
    }
    if (s['@category'] !== undefined) {
      model = model.with({ category: s['@category'] });
    }
    if (s['@audience'] !== undefined) {
      model = model.with({ audience: s['@audience'] });
    }
    
    getChildren(s).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();
     
      switch (key) {
        case 'metadata:metadata':
          model = model.with({ metadata: Maybe.just(item) });
          break;
        case 'dependencies':
          model = model.with(
            { dependencies: Maybe.just(Dependencies.fromPersistence(item, id)) });
          break;
        case 'preconditions':
          model = model.with(
            { preconditions: Maybe.just(Preconditions.fromPersistence(item, id)) });
          break;
        case 'unordered':
          model = model.with(
            { unordered: Maybe.just(Unordered.fromPersistence(item, id)) });
          break;
        case 'unit':
          model = model.with(
            { children: model.children.set(id, Unit.fromPersistence(item, id)) });
          break;
        case 'module':
          model = model.with(
            { children: model.children.set(id, Module.fromPersistence(item, id)) });
          break;
        case 'include':
          model = model.with(
            { children: model.children.set(id, Include.fromPersistence(item, id)) });
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
    this.dependencies.lift(p => children.push(p.toPersistence()));
    this.preconditions.lift(p => children.push(p.toPersistence()));
    this.supplements.lift(p => children.push(p.toPersistence()));
    this.children.toArray().forEach(c => children.push(c.toPersistence()));
    this.unordered.lift(p => children.push(p.toPersistence()));
    
    const s = { 
      sequence: {
        '@id': this.id,
        '@category': this.category,
        '@audience': this.audience,
        '#array': children,
      }, 
    };

    this.progressConstraintIdref.lift(p => s.sequence['@progress_constraint_idref'] = p);
    
    return s;
  }
}
