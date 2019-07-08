import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { ResourceId } from 'data/types';

export type SkillParams = {
  id?: ResourceId,
  guid?: string,
  title?: string,
  p?: string,
  gamma0?: string,
  gamma1?: string,
  lambda0?: string,
};

const defaultContent = {
  contentType: 'Skill',
  elementType: 'skill',
  id: ResourceId.of(''),
  guid: '',
  title: '',
  p: '',
  gamma0: '',
  gamma1: '',
  lambda0: '',
};

export class Skill extends Immutable.Record(defaultContent) {

  contentType: 'Skill';
  elementType: 'skill';
  id: ResourceId;
  guid: string;
  title: string;
  p: string;
  gamma0: string;
  gamma1: string;
  lambda0: string;

  constructor(params?: SkillParams) {
    super(augment(params));
  }

  with(values: SkillParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const skill = (root as any).skill;
    let model = new Skill({ guid });

    if (skill['@id'] !== undefined) {
      model = model.with({ id: ResourceId.of(skill['@id']) });
    }
    if (skill['@p'] !== undefined) {
      model = model.with({ p: skill['@p'] });
    }
    if (skill['@gamma0'] !== undefined) {
      model = model.with({ gamma0: skill['@gamma0'] });
    }
    if (skill['@gamma1'] !== undefined) {
      model = model.with({ gamma1: skill['@gamma1'] });
    }
    if (skill['@lambda0'] !== undefined) {
      model = model.with({ lambda0: skill['@lambda0'] });
    }

    getChildren(skill).forEach((item) => {

      const key = getKey(item);

      switch (key) {
        case '#text':
          model = model.with({ title: item['#text'] });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {
    const s = {
      skill: {
        '@id': this.id.value(),
        '#array': [{ '#text': this.title }],
      },
    };

    if (this.p !== '') {
      s.skill['@p'] = this.p;
    }
    if (this.gamma0 !== '') {
      s.skill['@gamma0'] = this.gamma0;
    }
    if (this.gamma1 !== '') {
      s.skill['@gamma1'] = this.gamma1;
    }
    if (this.lambda0 !== '') {
      s.skill['@lambda0'] = this.lambda0;
    }

    return s;
  }
}
