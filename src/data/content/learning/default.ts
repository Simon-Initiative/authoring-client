import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type DefaultParams = {
  content?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Default',
  elementType: 'default',
  content: '',
  guid: '',
};

export class Default extends Immutable.Record(defaultContent) {
  contentType: 'Default';
  elementType: 'default';
  content: string;
  guid: string;

  constructor(params?: DefaultParams) {
    super(augment(params));
  }

  with(values: DefaultParams) {
    return this.merge(values) as this;
  }


  clone() : Default {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify) : Default {
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
