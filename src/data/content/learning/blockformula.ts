import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';

import { ContiguousText, ContigiousTextMode } from 'data/content/learning/contiguous';

export type BlockFormulaParams = {
  text?: ContiguousText,
  guid?: string,
};

const defaultContent = {
  contentType: 'BlockFormula',
  text: ContiguousText.fromText('', '').with({ mode: ContigiousTextMode.SimpleText }),
  guid: '',
};

export class BlockFormula extends Immutable.Record(defaultContent) {

  contentType: 'BlockFormula';
  text: ContiguousText;
  guid: string;

  constructor(params?: BlockFormulaParams) {
    super(augment(params));
  }

  with(values: BlockFormulaParams) {
    return this.merge(values) as this;
  }

  clone() : BlockFormula {
    return this.with({
      text: this.text.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : BlockFormula {

    const t = (root as any).formula;

    const text = ContiguousText.fromPersistence(getChildren(t), '')
      .with({ mode: ContigiousTextMode.SimpleText });

    return new BlockFormula({ guid, text });

  }

  toPersistence() : Object {

    return {
      formula: {
        '#array': this.text.toPersistence(),
      },
    };
  }
}
