import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { InlineContent } from '../types/inline';

export type CodeParams = {
  text?: InlineContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'Code',
  text: new InlineContent(),
  guid: '',
};

export class Code extends Immutable.Record(defaultContent) {

  contentType: 'Code';
  text: InlineContent;
  guid: string;

  constructor(params?: CodeParams) {
    super(augment(params));
  }

  with(values: CodeParams) {
    return this.merge(values) as this;
  }

  clone() : Code {
    return this.with({
      text: this.text.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Code {

    const t = (root as any).code;

    const text = InlineContent.fromPersistence(getChildren(t), '');
    return new Code({ guid, text });

  }

  toPersistence() : Object {

    return {
      code: {
        '#array': this.text.toPersistence(),
      },
    };
  }
}
