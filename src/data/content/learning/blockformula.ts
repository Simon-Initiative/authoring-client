import * as Immutable from 'immutable';

import { augment, getChildren, ensureIdGuidPresent } from '../common';

import { ContiguousText, ContiguousTextMode } from 'data/content/learning/contiguous';

export type BlockFormulaParams = {
  text?: ContiguousText,
  guid?: string,
};

const defaultContent = {
  contentType: 'BlockFormula',
  elementType: 'blockformula',
  text: ContiguousText.fromText('', '').with({ mode: ContiguousTextMode.SimpleText }),
  guid: '',
};

export class BlockFormula extends Immutable.Record(defaultContent) {

  contentType: 'BlockFormula';
  elementType: 'blockformula';
  text: ContiguousText;
  guid: string;

  constructor(params?: BlockFormulaParams) {
    super(augment(params));
  }

  with(values: BlockFormulaParams) {
    return this.merge(values) as this;
  }

  clone(): BlockFormula {
    return ensureIdGuidPresent(this.with({
      text: this.text.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): BlockFormula {

    const t = (root as any).formula;
    const text = ContiguousText.fromPersistence(getChildren(t), '', ContiguousTextMode.SimpleText);
    return new BlockFormula({ guid, text });
  }

  toPersistence(): Object {

    return {
      formula: {
        '#array': this.text.toPersistence(),
      },
    };
  }
}
