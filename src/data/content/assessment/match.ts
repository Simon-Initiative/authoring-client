import * as Immutable from 'immutable';
import { augment } from '../common';

export type MatchParams = {
  input?: string,
  match?: string,
  guid?: string;
};

const defaultContent = {
  contentType: 'Match',
  elementType: 'match',
  input: '',
  match: '',
  guid: '',
};

export class Match extends Immutable.Record(defaultContent) {

  contentType: 'Match';
  elementType: 'match';
  input: string;
  match: string;
  guid: string;

  constructor(params?: MatchParams) {
    super(augment(params));
  }

  with(values: MatchParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Match {

    const p = (root as any).match;

    let model = new Match({ guid });

    if (p['@input'] !== undefined) {
      model = model.with({ input: p['@input'] });
    }
    if (p['@match'] !== undefined) {
      model = model.with({ match: p['@match'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      match: {
        '@input': this.input,
        '@match': this.match,
      },
    };
  }
}
