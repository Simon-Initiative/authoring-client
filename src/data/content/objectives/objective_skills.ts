import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { ResourceId } from 'data/types';

export type ObjectiveSkillsParams = {
  idref?: ResourceId,
  guid?: string,
  skills?: Immutable.Set<ResourceId>,
};

const defaultContent = {
  contentType: 'ObjectiveSkills',
  elementType: 'objective_skills',
  idref: ResourceId.of(''),
  guid: '',
  skills: Immutable.Set<ResourceId>(),
};

export class ObjectiveSkills extends Immutable.Record(defaultContent) {

  contentType: 'ObjectiveSkills';
  elementType: 'objective_skills';
  idref: ResourceId;
  guid: string;
  title: string;
  skills: Immutable.Set<ResourceId>;

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
      model = model.with({ idref: ResourceId.of(o['@idref']) });
    }

    getChildren(o).forEach((item) => {

      const key = getKey(item);

      switch (key) {
        case 'skillref':
          model = model.with({
            skills: model.skills.add(ResourceId.of((item as any).skillref['@idref'])),
          });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {
    const o = {
      objective_skills: {
        '@idref': this.idref.value(),
        '#array': this.skills.toArray().map(s => ({ skillref: { '@idref': s.value() } })),
      },
    };

    return o;
  }
}
