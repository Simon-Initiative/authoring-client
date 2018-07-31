import * as Immutable from 'immutable';

import { Choice } from './choice';
import createGuid from '../../../utils/guid';
import { augment, getChildren, setId, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';


export type MultipleChoiceParams = {
  choices?: Immutable.OrderedMap<string, Choice>,
  id?: string,
  name?: string,
  labels?: boolean,
  select?: string,
  shuffle?: boolean,
  guid?: string,
};

const defaultContent = {
  contentType: 'MultipleChoice',
  elementType: 'multiple_choice',
  choices: Immutable.OrderedMap<string, Choice>(),
  id: '',
  name: '',
  labels: false,
  select: 'single',
  shuffle: true,
  guid: '',
};

export class MultipleChoice extends Immutable.Record(defaultContent) {

  contentType: 'MultipleChoice';
  elementType: 'multiple_choice';
  choices: Immutable.OrderedMap<string, Choice>;
  id: string;
  name: string;
  labels: boolean;
  select: string;
  shuffle: boolean;
  guid: string;

  constructor(params?: MultipleChoiceParams) {
    super(augment(params));
  }

  clone(): MultipleChoice {
    return ensureIdGuidPresent(this.with({
      choices: this.choices.mapEntries(([_, v]) => {
        const clone: Choice = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Choice>,
    }));
  }

  with(values: MultipleChoiceParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void): MultipleChoice {

    const q = (json as any).multiple_choice;
    let model = new MultipleChoice({ guid });

    model = setId(model, q, notify);

    if (q['@name'] !== undefined) {
      model = model.with({ name: q['@name'] });
    }
    if (q['@shuffle'] !== undefined) {
      model = model.with({ shuffle: q['@shuffle'] === 'true' });
    }
    if (q['@select'] !== undefined) {
      model = model.with({ select: q['@select'] });
    }
    if (q['@labels'] !== undefined) {
      model = model.with({ labels: q['@labels'] === 'true' });
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

    const choices = this.choices.toArray().map(c => c.toPersistence());

    return {
      multiple_choice: {
        '@shuffle': this.shuffle ? 'true' : 'false',
        '@select': this.select,
        '@id': this.id,
        '@name': this.name,
        '@labels': this.labels ? 'true' : 'false',
        '#array': choices,
      },
    };
  }
}
