import * as Immutable from 'immutable';

import { augment } from '../common';

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

  clone() : Variable {
    return this;
  }

  static fromPersistence(root: Object, guid: string) {

    const v = (root as any).variable;
    let model = new Variable({ guid });

    if (v['#text'] !== undefined) {
      model = model.with({ expression: v['#text'] });
    }
    if (v['#cdata'] !== undefined) {
      model = model.with({ expression: v['#cdata'] });
    }
    if (v['@name'] !== undefined) {
      model = model.with({ name: v['@name'] });
    }
    if (v['@id'] !== undefined) {
      model = model.with({ id: v['@id'] });
    }

    return model;
  }

  toPersistence() : Object {

    const root = { variable: {} };

    root.variable['#text'] = this.expression;
    root.variable['@name'] = this.name;
    if (this.id !== '') {
      root.variable['@id'] = this.id;
    }
    return root;
  }
}
