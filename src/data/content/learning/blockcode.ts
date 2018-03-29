import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';

import { ContiguousText, ContiguousTextMode } from 'data/content/learning/contiguous';

export type BlockCodeParams = {
  text?: ContiguousText,
  guid?: string,
};

const defaultContent = {
  contentType: 'BlockCode',
  text: ContiguousText.fromText('', '').with({ mode: ContiguousTextMode.SimpleText }),
  guid: '',
};

export class BlockCode extends Immutable.Record(defaultContent) {

  contentType: 'BlockCode';
  text: ContiguousText;
  guid: string;

  constructor(params?: BlockCodeParams) {
    super(augment(params));
  }

  with(values: BlockCodeParams) {
    return this.merge(values) as this;
  }

  clone() : BlockCode {
    return this.with({
      text: this.text.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : BlockCode {

    const t = (root as any).code;
    const text = ContiguousText.fromPersistence(getChildren(t), '', ContiguousTextMode.SimpleText);
    return new BlockCode({ guid, text });
  }

  toPersistence() : Object {

    return {
      code: {
        '#array': this.text.toPersistence(),
      },
    };
  }
}
