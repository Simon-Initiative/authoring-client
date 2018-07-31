import * as Immutable from 'immutable';

import { Choice } from './choice';
import createGuid from '../../../utils/guid';
import { augment, getChildren, setId, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';


export type FillInTheBlankParams = {
  choices?: Immutable.OrderedMap<string, Choice>,
  id?: string,
  name?: string,
  shuffle?: boolean,
  guid?: string,
};

const defaultContent = {
  contentType: 'FillInTheBlank',
  elementType: 'fill_in_the_blank',
  choices: Immutable.OrderedMap<string, Choice>(),
  id: '',
  name: '',
  shuffle: true,
  guid: '',
};

export class FillInTheBlank extends Immutable.Record(defaultContent) {

  contentType: 'FillInTheBlank';
  elementType: 'fill_in_the_blank';
  choices: Immutable.OrderedMap<string, Choice>;
  id: string;
  name: string;
  shuffle: boolean;
  guid: string;

  constructor(params?: FillInTheBlankParams) {
    super(augment(params));
  }

  clone(): FillInTheBlank {
    return ensureIdGuidPresent(this.with({
      choices: this.choices.mapEntries(([_, v]) => {
        const clone: Choice = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Choice>,
    }));
  }

  with(values: FillInTheBlankParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void): FillInTheBlank {

    const q = (json as any).fill_in_the_blank;
    let model = new FillInTheBlank({ guid });

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

    const choices = this.choices.toArray().map(c => c.toPersistence());

    return {
      fill_in_the_blank: {
        '@shuffle': this.shuffle ? 'true' : 'false',
        '@id': this.id,
        '@name': this.name,
        '#array': choices,
      },
    };
  }
}
