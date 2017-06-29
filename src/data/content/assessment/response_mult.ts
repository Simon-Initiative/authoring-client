import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Match } from './match';

export type ResponseMultParams = {
  matchStyle?: string,
  score?: string,
  name?: string,
  matches?: Immutable.OrderedMap<string, Match>,
  guid?: string,
};

const defaultContent = {
  contentType: 'ResponseMult',
  matchStyle: 'any',
  score: '0',
  name: '',
  matches: Immutable.OrderedMap<string, Match>(),
  guid: '',
};

export class ResponseMult extends Immutable.Record(defaultContent) {
  
  contentType: 'ResponseMult';
  matchStyle: string;
  score: string;
  name: string;
  matches: Immutable.OrderedMap<string, Match>;
  guid: string;
  
  constructor(params?: ResponseMultParams) {
    super(augment(params));
  }

  with(values: ResponseMultParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : ResponseMult {

    const p = (root as any).response_mult;

    let model = new ResponseMult({ guid });
    
    if (p['@match_style'] !== undefined) {
      model = model.with({ matchStyle: p['@match_style'] });
    }
    if (p['@score'] !== undefined) {
      model = model.with({ score: p['@score'] });
    }
    if (p['@name'] !== undefined) {
      model = model.with({ name: p['@name'] });
    }

    getChildren(p).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'match':
          model = model.with({ matches: model.matches.set(id, Match.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    
    return model;
  }

  toPersistence() : Object {

    const matches = this.matches.toArray().map(m => m.toPersistence());

    return {
      response_mult: {
        '@score': this.score.trim() === '' ? '0' : this.score,
        '@name': this.name,
        '@match_style': this.matchStyle,
        '#array': [...matches],
      },
    };
  }
}
