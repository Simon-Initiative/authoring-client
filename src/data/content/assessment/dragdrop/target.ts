import * as Immutable from 'immutable';
import { augment } from '../../common';

export type TargetParams = {
  guid?: string;
  assessmentId?: string;
};

const defaultContent = {
  contentType: 'Target',
  elementType: 'target',
  guid: '',
  assessmentId: '',
};

export class Target extends Immutable.Record(defaultContent) {

  contentType: 'Target';
  elementType: 'target';
  guid: string;
  assessmentId: string;

  constructor(params?: TargetParams) {
    super(augment(params));
  }

  with(values: TargetParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : Target {

    const q = (json as any).target;
    let model = new Target({ guid });

    if (q['@assessmentId'] !== undefined) {
      model = model.with({ assessmentId: q['@assessmentId'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      target: {
        '@assessmentId': this.assessmentId,
      },
    };
  }
}
