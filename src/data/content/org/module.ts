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
import { Include } from './include';
import createGuid from '../../../utils/guid';

import * as types from './types';

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
  id: '',
  title: '',
  description: Maybe.nothing<string>(),
  metadata: Maybe.nothing<Object>(),
  dependences: Maybe.nothing<Dependencies>(),
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
    super(augment(params));
  }

  with(values: ModuleParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).module;
    let model = new Module({ guid });

    if (s['@id'] !== undefined) {
      model = model.with({ id: s['@id'] });
    }
    if (s['@progress_constraint_idref'] !== undefined) {
      model = model.with({ progressConstraintIdref: Maybe.just(s['@progress_constraint_idref']) });
    }
    if (s['@duration'] !== undefined) {
      model = model.with({ duration: Maybe.just(s['@duration']) });
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
        case 'section':
          model = model.with(
            { children: model.children.set(id, Section.fromPersistence(item, id)) });
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
