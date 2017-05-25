import * as Immutable from 'immutable';

import { Unsupported } from './unsupported';
import createGuid from '../../utils/guid';
import { getKey } from '../common';
import { getChildren, augment } from './common';
import { Pool } from './pool';
import { PoolRef } from './pool_ref';

export type SelectionSource = Pool | PoolRef;

export type SelectionParams = {
  id?: string;
  selectionCount?: number;
  strategy?: string;
  exhaustion?: string;
  scope?: string;
  source?: SelectionSource;
  guid?: string;
};

const defaultSelectionParams = {
  contentType: 'Selection',
  id: '',
  selectionCount: 1,
  strategy: 'random',
  exhaustion: 'reuse',
  scope: 'resource',
  source: new Pool(),
  guid: '',
};

export class Selection extends Immutable.Record(defaultSelectionParams) {

  contentType: 'Selection';
  id: string;
  selectionCount: number;
  strategy: string;
  exhaustion: string;
  scope: string;
  source: SelectionSource;
  guid: string;
  
  constructor(params?: SelectionParams) {
    super(augment(params));
  }

  with(values: SelectionParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string) {

    let model = new Selection({ guid });

    const s = json.selection;

    if (s['@id'] !== undefined) {
      model = model.with({ id: s['@id'] });
    }
    if (s['@count'] !== undefined) {
      model = model.with({ selectionCount: s['@count'] });
    }
    if (s['@strategy'] !== undefined) {
      model = model.with({ strategy: s['@strategy'] });
    }
    if (s['@exhaustion'] !== undefined) {
      model = model.with({ exhaustion: s['@exhaustion'] });
    }
    if (s['@scope'] !== undefined) {
      model = model.with({ scope: s['@scope'] });
    }
    
    getChildren(s).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'pool':
          model = model.with({ source: Pool.fromPersistence(item, id) });
          break;
        case 'pool_ref':
          model = model.with({ source: PoolRef.fromPersistence(item, id) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = [this.source.toPersistence()];

    return {
      selection: {
        '@id': this.id,
        '@count': this.selectionCount,
        '@strategy': this.strategy,
        '@exhaustion': this.exhaustion,
        '@scope': this.scope,
        '#array': children,
      },
    };
  }
}
