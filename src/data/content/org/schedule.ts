import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import * as types from './types';
import { Before } from './before';
import createGuid from '../../../utils/guid';

export type ScheduleParams = {
  before?: Immutable.OrderedMap<string, Before>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Schedule,
  before: Immutable.OrderedMap<string, Before>(),
  guid: '',
};

export class Schedule extends Immutable.Record(defaultContent) {
  
  contentType: types.ContentTypes.Schedule;
  before?: Immutable.OrderedMap<string, Before>;
  guid: string;
  
  constructor(params?: ScheduleParams) {
    super(augment(params));
  }

  with(values: ScheduleParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).schedule;
    let model = new Schedule({ guid });

    getChildren(s).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();
     
      switch (key) {
        case 'before':
          model = model.with({ before: model.before.set(id, Before.fromPersistence(item, id)) });
          break;
        default:
          
      }
    });
    
    return model;
  }

  toPersistence() : Object {
    
    const s = { 
      schedule: {
        '#array': this.before.toArray().map(s => s.toPersistence()),
      }, 
    };

    return s;
  }
}
