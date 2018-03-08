import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';

export type MathParams = {
  data?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Math',
  data: '<math><mi>c</mi><mo>=</mo><msqrt><msup><mi>a</mi><mn>2</mn>'
    + '</msup><mo>+</mo><msup><mi>b</mi><mn>2</mn></msup></msqrt></math>',
  guid: '',
};

export class Math extends Immutable.Record(defaultContent) {
  contentType: 'Math';
  data: string;
  guid: string;

  constructor(params?: MathParams) {
    super(augment(params));
  }

  with(values: MathParams) {
    return this.merge(values) as this;
  }


  clone() : Math {
    return this;
  }

  static fromPersistence(root: Object, guid: string) : Math {

    if ((root as any)['m:math'] !== undefined) {
      return new Math({ guid, data: (root as any)['m:math']['#cdata'] });
    }
    if ((root as any)['#math'] !== undefined) {
      return new Math({ guid, data: (root as any)['#math'] });
    }

    console.log('UNKNOWN MATH FORMAT ENCOUNTERED');

    return new Math({ guid });
  }

  toPersistence() : Object {
    return {
      'm:math': {
        '#cdata': this.data,
      },
    };
  }
}
