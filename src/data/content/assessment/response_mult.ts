import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';
import { Match } from './match';
import { Maybe } from 'tsmonad';

export type ResponseMultParams = {
  matchStyle?: string,
  score?: Maybe<string>,
  name?: string,
  matches?: Immutable.OrderedMap<string, Match>,
  guid?: string,
};

const defaultContent = {
  contentType: 'ResponseMult',
  elementType: 'response_mult',
  matchStyle: 'any',
  score: Maybe.just('0'),
  name: '',
  matches: Immutable.OrderedMap<string, Match>(),
  guid: '',
};

export class ResponseMult extends Immutable.Record(defaultContent) {

  contentType: 'ResponseMult';
  elementType: 'response_mult';
  matchStyle: string;
  score: Maybe<string>;
  name: string;
  matches: Immutable.OrderedMap<string, Match>;
  guid: string;

  constructor(params?: ResponseMultParams) {
    super(augment(params));
  }


  clone(): ResponseMult {
    return ensureIdGuidPresent(this);
  }

  with(values: ResponseMultParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): ResponseMult {

    const p = (root as any).response_mult;

    let model = new ResponseMult({ guid });

    if (p['@match_style'] !== undefined) {
      model = model.with({ matchStyle: p['@match_style'] });
    }
    if (p['@score'] !== undefined) {
      model = model.with({ score: p['@score'] });
    } else {
      model = model.with({ score: Maybe.nothing() });
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

  toPersistence(): Object {

    const matches = this.matches.toArray().map(m => m.toPersistence());

    const o = {
      response_mult: {
        '@name': this.name,
        '@match_style': this.matchStyle,
        '#array': [...matches],
      },
    };

    this.score.lift((score) => {
      if (score.trim() !== '') {
        o.response_mult['@score'] = score;
      }
    });

    return o;
  }
}
