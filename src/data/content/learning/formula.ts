import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
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
    return ensureIdGuidPresent(this.with({
      text: this.text.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Formula {

    const t = (root as any).formula;

    const text = ContentElements.fromPersistence(t, '', TEXT_ELEMENTS, null, notify);
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
