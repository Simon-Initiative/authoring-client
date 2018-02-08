import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

export type DefaultParams = {
  content?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Default',
  content: '',
  guid: '',
};

export class Default extends Immutable.Record(defaultContent) {
  contentType: 'Default';
  content: string;
  guid: string;

  constructor(params?: DefaultParams) {
    super(augment(params));
  }

  with(values: DefaultParams) {
    return this.merge(values) as this;
  }


  clone() : Default {
    return this;
  }

  static fromPersistence(root: Object, guid: string) : Default {
    const t = (root as any).default;

    if (t['#text'] !== undefined) {
      return new Default().with({ content: t['#text'] });
    }
    return new Default();
  }

  toPersistence() : Object {
    return {
      default: {
        '#text': this.content,
      },
    };
  }
}
