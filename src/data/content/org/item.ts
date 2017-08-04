import * as Immutable from 'immutable';

import { defaultIdGuid, getChildren } from '../common';
import { getKey } from '../../common';
import { Maybe } from 'tsmonad';
import { ResourceRef } from './resourceref';
import { Preconditions } from './preconditions';
import { Supplements } from './supplements';
import { Schedule } from './schedule';
import createGuid from '../../../utils/guid';

import * as types from './types';

export type ItemParams = {
  id?: string,
  purpose?: Maybe<types.PurposeTypes>,
  duration?: Maybe<string>,
  scoringMode?: types.ScoringModes,
  preferences?: Object,
  resourceref?: ResourceRef,
  preconditions?: Maybe<Preconditions>,
  supplements?: Maybe<Supplements>,
  schedule?: Maybe<Schedule>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Item,
  id: '',
  purpose: Maybe.nothing<types.PurposeTypes>(),
  duration: Maybe.nothing<string>(),
  scoringMode: types.ScoringModes.Default,
  preferences: Maybe.nothing<Object>(),
  resourceref: new ResourceRef(),
  preconditions: Maybe.nothing<Preconditions>(),
  supplements: Maybe.nothing<Supplements>(),
  schedule: Maybe.nothing<Schedule>(),
  guid: '',
};

export class Item extends Immutable.Record(defaultContent) {
  
  contentType: types.ContentTypes.Item;
  id: string;
  purpose: Maybe<types.PurposeTypes>;
  duration: Maybe<string>;
  preferences: Maybe<Object>;
  scoringMode: types.ScoringModes;
  resourceref: ResourceRef;
  preconditions: Maybe<Preconditions>;
  supplements: Maybe<Supplements>;
  schedule: Maybe<Schedule>;
  guid: string;
  
  constructor(params?: ItemParams) {
    super(defaultIdGuid(params));
  }

  with(values: ItemParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).item;
    let model = new Item({ guid });

    if (s['@id'] !== undefined) {
      model = model.with({ id: s['@id'] });
    }
    if (s['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(s['@purpose']) });
    }
    if (s['@duration'] !== undefined) {
      model = model.with({ duration: Maybe.just(s['@duration']) });
    }
    if (s['@scoring_mode'] !== undefined) {
      model = model.with({ scoringMode: s['@scoring_mode'] });
    }

    getChildren(s).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();
     
      switch (key) {
        case 'resourceref':
          model = model.with({ resourceref: ResourceRef.fromPersistence(item, id) });
          break;
        case 'preferences:preference_values':
          model = model.with({ preferences: Maybe.just(item) });
          break;
        case 'preconditions':
          model = model.with(
            { preconditions: Maybe.just(Preconditions.fromPersistence(item, id)) });
          break;
        case 'supplements':
          model = model.with(
            { supplements: Maybe.just(Supplements.fromPersistence(item, id)) });
          break;
        case 'schedule':
          model = model.with(
            { schedule: Maybe.just(Schedule.fromPersistence(item, id)) });
          break;
        default:
          
      }
    });
    
    return model;
  }

  toPersistence() : Object {

    const children = [this.resourceref.toPersistence()];

    this.preferences.lift(p => children.push(p));
    this.preconditions.lift(p => children.push(p.toPersistence));
    this.supplements.lift(p => children.push(p.toPersistence));
    this.schedule.lift(p => children.push(p.toPersistence));
    
    const s = { 
      item: {
        '@id': this.id,
        '@scoring_mode': this.scoringMode,
        '#array': children,
      }, 
    };

    this.purpose.lift(p => s.item['@purpose'] = p);

    return s;
  }
}
