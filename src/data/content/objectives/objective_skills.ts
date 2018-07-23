import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

export type ObjectiveSkillsParams = {
  idref?: string,
  guid?: string,
  skills?: Immutable.Set<string>,
};

const defaultContent = {
  contentType: 'ObjectiveSkills',
  elementType: 'objective_skills',
  idref: '',
  guid: '',
  skills: Immutable.Set<string>(),
};

export class ObjectiveSkills extends Immutable.Record(defaultContent) {

  contentType: 'ObjectiveSkills';
  elementType: 'objective_skills';
  idref: string;
  guid: string;
  title: string;
  skills: Immutable.Set<string>;

  constructor(params?: ObjectiveSkillsParams) {
    super(augment(params));
  }

  with(values: ObjectiveSkillsParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const o = (root as any).objective_skills;
    let model = new ObjectiveSkills({ guid });

    if (o['@idref'] !== undefined) {
      model = model.with({ idref: o['@idref'] });
    }

    getChildren(o).forEach((item) => {

      const key = getKey(item);

      switch (key) {
        case 'skillref':
          model = model.with({ skills: model.skills.add((item as any).skillref['@idref']) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {
    const o = {
      objective_skills: {
        '@idref': this.idref,
        '#array': this.skills.toArray().map(s => ({ skillref: { '@idref': s } })),
      },
    };

    return o;
  }
}
