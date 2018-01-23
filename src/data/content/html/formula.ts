import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { Text } from './text';

export type FormulaParams = {
  text?: Text,
  guid?: string,
};

const defaultContent = {
  contentType: 'Formula',
  text: new Text(),
  guid: '',
};

export class Formula extends Immutable.Record(defaultContent) {

  contentType: 'Formula';
  text: Text;
  guid: string;

  constructor(params?: FormulaParams) {
    super(augment(params));
  }

  with(values: FormulaParams) {
    return this.merge(values) as this;
  }

  clone() : Formula {
    return this.with({
      text: this.text.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Formula {

    const t = (root as any).formula;

    const text = new Text().with({ content: getChildren(t) });
    return new Formula({ guid, text });

  }

  toPersistence() : Object {

    return {
      formula: {
        '#array': this.text.toPersistence(),
      },
    };
  }
}
