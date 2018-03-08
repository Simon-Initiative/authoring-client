import * as Immutable from 'immutable';
import { augment } from '../common';

export type MathParams = {
  data?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Math',
  data: '<m:math><m:mi>c</m:mi><m:mo>=</m:mo><m:msqrt><m:msup><m:mi>a</m:mi><m:mn>2</m:mn>'
    + '</m:msup><m:mo>+</m:mo><m:msup><m:mi>b</m:mi><m:mn>2</m:mn></m:msup></m:msqrt></m:math>',
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
      '#math': this.data,
    };
  }
}
