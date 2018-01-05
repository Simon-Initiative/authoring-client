import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';

import { LegacyTypes } from '../types';

export type SkillsModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  lock?: contentTypes.Lock,
  id?: string,
  title?: string,
  skills?: Immutable.OrderedMap<string, contentTypes.Skill>,
};
const defaultSkillsModelParams = {
  modelType: 'SkillsModel',
  resource: new contentTypes.Resource(),
  guid: '',
  id: '',
  type: LegacyTypes.skills_model,
  lock: new contentTypes.Lock(),
  title: 'New Skills',
  skills: Immutable.OrderedMap<string, contentTypes.Skill>(),
};


export class SkillsModel 
  extends Immutable.Record(defaultSkillsModelParams) {

  modelType: 'SkillsModel';
  resource: contentTypes.Resource;
  guid: string;
  lock: contentTypes.Lock;
  id: string;
  type: string;
  title: string;
  skills: Immutable.OrderedMap<string, contentTypes.Skill>;

  constructor(params?: SkillsModelParams) {
    params ? super(params) : super();
  }

  with(values: SkillsModelParams): SkillsModel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): SkillsModel {

    let model = new SkillsModel();

    const a = (json as any);
    model = model.with({ 
      resource: contentTypes.Resource.fromPersistence(a),
      guid: a.guid,
      title: a.title,
    });

    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }
    let org = null;


    if (a.doc instanceof Array) {
      org = a.doc[0];
    } else {
      org = a.doc;
    }

    if (org.skills_model !== undefined) {
      
      if (org.skills_model['@id'] !== undefined) {
        model = model.with({ id: org['@id'] });
      }
      const container = org.skills_model.skills === undefined 
        ? org.skills_model['#array'] : org.skills_model.skills;
        
      container.forEach((skill) => {

        const thisGuid = guid();
        const id = skill['@id'];
        const title = skill['@title'];
        const obj = new contentTypes.Skill().with({ id, guid: thisGuid, title });
        model = model.with({ skills: model.skills.set(obj.guid, obj) });
      });

    } else {

      org.skills['#array'].forEach((item) => {

        const key = getKey(item);
        const id = guid();

        switch (key) {
          case 'skill':
            const obj = contentTypes.Skill.fromPersistence(item, id);
            model = model.with({ skills: model.skills.set(obj.guid, obj) });
            break;
          default:
            
        }
      });
    }

    return model;
  }

  toPersistence(): Object {
    const children : Object[] = [
      { title: { '#text': this.title } }];
    
    if (this.skills.size === 0) {
      const id = guid();
      const o = new contentTypes.Skill().with({
        title: 'Default skill',
        id,
      });
      children.push(o.toPersistence());
    } else {
      this.skills.toArray().forEach(o => children.push(o.toPersistence()));
    }
    
    const resource = this.resource.toPersistence();
    const doc = [{
      skills: {
        '@id': this.resource.id,
        '#array': children,
      },
    }];

    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}
