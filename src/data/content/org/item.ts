import * as Immutable from 'immutable';

import { defaultIdGuid, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { Maybe } from 'tsmonad';
import { ResourceRef } from 'data/content/org/resourceref';
import { Preconditions } from 'data/content/org/preconditions';
import { Supplements } from 'data/content/org/supplements';
import { Schedule } from 'data/content/org/schedule';
import createGuid from 'utils/guid';

import * as types from 'data/content/org/types';

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
  elementType: 'item',
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
  elementType: 'item';
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
    const params = { guid } as any;

    if (s['@id'] !== undefined) {
      params.id = s['@id'];
    }
    if (s['@purpose'] !== undefined) {
      params.purpose = Maybe.just(s['@purpose']);
    }
    if (s['@duration'] !== undefined) {
      params.duration = Maybe.just(s['@duration']);
    }
    if (s['@scoring_mode'] !== undefined) {
      params.scoringMode = s['@scoring_mode'];
    }

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'resourceref':
          params.resourceref = ResourceRef.fromPersistence(item, id);
          break;
        case 'preferences:preference_values':
          params.preferences = Maybe.just(item);
          break;
        case 'preconditions':
          params.preconditions = Maybe.just(Preconditions.fromPersistence(item, id));
          break;
        case 'supplements':
          params.supplements = Maybe.just(Supplements.fromPersistence(item, id));
          break;
        case 'schedule':
          params.schedule = Maybe.just(Schedule.fromPersistence(item, id));
          break;
        default:

      }
    });

    return new Item(params);
  }

  toPersistence(): Object {

    const children = [this.resourceref.toPersistence()];

    this.preferences.lift(p => children.push(p));
    this.preconditions.lift(p => children.push(p.toPersistence()));
    this.supplements.lift(p => children.push(p.toPersistence()));
    this.schedule.lift(p => children.push(p.toPersistence()));

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
