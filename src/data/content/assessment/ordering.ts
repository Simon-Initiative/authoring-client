import * as Immutable from 'immutable';

import { Choice } from './choice';
import createGuid from '../../../utils/guid';
import { augment, getChildren, setId, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';


export type OrderingParams = {
  choices?: Immutable.OrderedMap<string, Choice>,
  id?: string,
  name?: string,
  shuffle?: boolean,
  guid?: string,
};

const defaultContent = {
  contentType: 'Ordering',
  elementType: 'ordering',
  choices: Immutable.OrderedMap<string, Choice>(),
  id: '',
  name: '',
  shuffle: true,
  guid: '',
};

export class Ordering extends Immutable.Record(defaultContent) {

  contentType: 'Ordering';
  elementType: 'ordering';
  choices: Immutable.OrderedMap<string, Choice>;
  id: string;
  name: string;
  shuffle: boolean;
  guid: string;

  constructor(params?: OrderingParams) {
    super(augment(params));
  }

  clone(): Ordering {
    return ensureIdGuidPresent(this.with({
      choices: this.choices.mapEntries(([_, v]) => {
        const clone: Choice = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Choice>,
    }));
  }

  with(values: OrderingParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void): Ordering {

    const q = (json as any).ordering;
    let model = new Ordering({ guid });

    model = setId(model, q, notify);

    if (q['@name'] !== undefined) {
      model = model.with({ name: q['@name'] });
    }
    if (q['@shuffle'] !== undefined) {
      model = model.with({ shuffle: q['@shuffle'] === 'true' });
    }

    getChildren(q).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'choice':
          model = model.with({
            choices: model.choices.set(id, Choice.fromPersistence(item, id, notify)),
          });
          break;
        default:
      }
    });

    return model;

  }

  toPersistence(): Object {

    const arr = this.choices.toArray();

    const choices = arr.length > 0
      ? this.choices.toArray().map(c => c.toPersistence())
      : [Choice.fromText('', '').toPersistence()];

    return {
      ordering: {
        '@shuffle': this.shuffle ? 'true' : 'false',
        '@id': this.id,
        '@name': this.name,
        '#array': choices,
      },
    };
  }
}
