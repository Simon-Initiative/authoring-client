import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { TextContent } from '../types/text';

export type FormulaParams = {
  text?: TextContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'Formula',
  text: new TextContent(),
  guid: '',
};

export class Formula extends Immutable.Record(defaultContent) {

  contentType: 'Formula';
  text: TextContent;
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

    const text = TextContent.fromPersistence(t, '');
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
