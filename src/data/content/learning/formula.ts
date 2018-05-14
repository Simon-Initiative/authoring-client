import * as Immutable from 'immutable';

import { augment } from '../common';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';

export type FormulaParams = {
  text?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Formula',
  elementType: 'formula',
  text: new ContentElements().with({ supportedElements: Immutable.List(TEXT_ELEMENTS) }),
  guid: '',
};

export class Formula extends Immutable.Record(defaultContent) {

  contentType: 'Formula';
  elementType: 'formula';
  text: ContentElements;
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

    const text = ContentElements.fromPersistence(t, '', TEXT_ELEMENTS);
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
