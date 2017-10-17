import * as Immutable from 'immutable';

import { Maybe } from 'tsmonad';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { KnowledgeCategory, LearningProcess } from './types';
import createGuid from '../../../utils/guid';


export type ObjectiveSkillsParams = {
  idref?: string,
  guid?: string,
  skills?: Immutable.List<string>,
};

const defaultContent = {
  contentType: 'ObjectiveSkills',
  idref: '',
  guid: '',
  skills: Immutable.List<string>(),
};

export class ObjectiveSkills extends Immutable.Record(defaultContent) {
  
  contentType: 'ObjectiveSkills';
  idref: string;
  guid: string;
  title: string;
  skills: Immutable.List<string>;
  
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
      const id = createGuid();
     
      switch (key) {
        case 'skillref':
          model = model.with({ skills: model.skills.push(item['skillref']['@idref']) });
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
