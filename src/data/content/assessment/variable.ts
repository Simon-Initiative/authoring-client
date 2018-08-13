import * as Immutable from 'immutable';

import { augment, ensureIdGuidPresent, setId } from '../common';

export type VariableParams = {
  expression?: string,
  name?: string,
  id?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Variable',
  elementType: 'variable',
  expression: '',
  name: '',
  id: '',
  guid: '',
};

export type Variables =
  // code: string;
  Immutable.OrderedMap<string, Variable>;

export class Variable extends Immutable.Record(defaultContent) {

  contentType: 'Variable';
  elementType: 'variable';
  expression: string;
  name: string;
  id: string;
  guid: string;

  constructor(params?: VariableParams) {
    super(augment(params));
  }

  with(values: VariableParams) {
    return this.merge(values) as this;
  }

  clone(): Variable {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) {

    const v = (root as any).variable;
    let model = new Variable({ guid });

    model = setId(model, v, notify);

    if (v['#text'] !== undefined) {
      model = model.with({ expression: v['#text'] });
    }
    if (v['#cdata'] !== undefined) {
      model = model.with({ expression: v['#cdata'] });
    }
    if (v['@name'] !== undefined) {
      model = model.with({ name: v['@name'] });
    }

    return model;
  }

  toPersistence(): Object {

    const root = { variable: {} };

    root.variable['#cdata'] = this.expression;
    root.variable['@name'] = this.name;
    if (this.id !== '') {
      root.variable['@id'] = this.id;
    }
    return root;
  }
}
