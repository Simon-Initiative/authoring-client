import * as Immutable from 'immutable';
import { augment } from '../common';
import { HasFlowContent } from './content';

export type LiParams = {
  enable?: boolean,
  content?: Immutable.OrderedMap<string, HasFlowContent>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Li',
  enable: true,
  content: '',
  guid: '',
};

export class Li extends Immutable.Record(defaultContent) {

  contentType: 'Li';
  enable: boolean;
  content: string;
  guid: string;

  constructor(params?: LiParams) {
    super(augment(params));
  }

  with(values: LiParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Li {

    const cb = (root as any).Li;

    let model = new Li({ guid });

    return model;
  }

  toPersistence() : Object {
    return {
      Li: {

      },
    };
  }
}
