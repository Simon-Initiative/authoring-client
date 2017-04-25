import * as Immutable from 'immutable';

import { Choice } from './choice';
import createGuid from '../../utils/guid';
import { augment, getChildren } from './common';
import { getKey } from '../common';


export type OrderingParams = {
  choices? : Immutable.OrderedMap<string, Choice>,
  id? : string,
  name? : string,
  shuffle? : boolean,
  guid?: string
};

const defaultContent = {
  choices: Immutable.OrderedMap<string, Choice>(),
  id: '',
  name: '',
  shuffle: true,
  guid: '',
  contentType: 'Ordering'
}

export class Ordering extends Immutable.Record(defaultContent) {
  
  contentType: 'Ordering';
  choices : Immutable.OrderedMap<string, Choice>;
  id : string;
  name : string;
  shuffle : boolean;
  guid: string;
  
  constructor(params?: OrderingParams) {
    super(augment(params));
  }

  with(values: OrderingParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : Ordering {
    
    let q = (json as any).ordering;
    let model = new Ordering({ guid });

    if (q['@id'] !== undefined) {
      model = model.with({ id: q['@id']});
    }
    if (q['@name'] !== undefined) {
      model = model.with({ name: q['@name']});
    }
    if (q['@shuffle'] !== undefined) {
      model = model.with({ shuffle: q['@shuffle'] === 'true'});
    }
    
    getChildren(q).forEach(item => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'choice':
          model = model.with({ choices: model.choices.set(id, Choice.fromPersistence(item, id))});
          break;
        default:
      }
    });

    return model;

  }

  toPersistence() : Object {

    const choices = this.choices.toArray().map(c => c.toPersistence());

    return {
      "ordering": {
        "@shuffle": this.shuffle ? 'true': 'false',
        "@id": this.id,
        "@name": this.name,
        "#array": choices
      }
    }
  }
}
