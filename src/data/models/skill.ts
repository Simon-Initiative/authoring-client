import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isNullOrUndefined, isArray } from 'util';


export type SkillModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string,
  lock?: contentTypes.Lock,
  title?: contentTypes.Title,
  skills?: Object[],
};

const defaultSkillModel = {
  modelType: 'SkillModel',
  resource: new contentTypes.Resource(),
  guid: '',
  type: 'x-oli-skills_model',
  lock: new contentTypes.Lock(),
  title: new contentTypes.Title(),
  skillDefaults: contentTypes.Skill,
  skills: [],
};

export class SkillModel extends Immutable.Record(defaultSkillModel) {
  modelType: 'SkillModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  lock: contentTypes.Lock;
  title: contentTypes.Title;
  skillDefaults: contentTypes.Skill;
  skills: Object[];

  constructor(params?: SkillModelParams) {  
    params ? super(params) : super(); 
  }

  with(values: SkillModelParams) {
    return this.merge(values) as this;
  }


  static updateModel(oldSkillModel: SkillModel, newSkillModel: any): SkillModel {
    let newModel = new SkillModel({ skills: newSkillModel });
    newModel = newModel.with({ resource: oldSkillModel.resource });
    newModel = newModel.with({ guid: oldSkillModel.guid });
    newModel = newModel.with({ type: oldSkillModel.type });
    newModel = newModel.with({ title: oldSkillModel.title });
    if (!isNullOrUndefined(oldSkillModel.lock)) {
      newModel = newModel.with({ lock: oldSkillModel.lock });
    }
    return newModel;
  }
    
  toPersistence(): Object {
    
    const resource: any = this.resource.toPersistence();
    let doc = [{
      skills_model: {
        '@id': this.resource.id,        
        '#array': this.skills,
      },
    }];

    // Add the title object to the array where we have the skills in
    // a very clumsy way.
    let titleObj=new Object ();
    titleObj ["title"]=new Object ();  
    titleObj ["title"]["#text"]=this.title.text;    

    doc [0]["skills_model"]["#array"] = [titleObj, ...doc [0]["skills_model"]["#array"]];  
      
    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }

  static fromPersistence(json: Object): SkillModel {      
    const a = (json as any);
    let replacementSkills = [];  
    const skillData: Array<contentTypes.Skill> = 
      a.doc.skills_model.skills !== undefined
      ? a.doc.skills_model.skills
      : a.doc.skills_model['#array'];
     
    let extractedTitle:contentTypes.Title = new contentTypes.Title().with({ text: 'Unassigned' });  

    for (let i = 0; i < skillData.length; i++) {
      const newSkill: contentTypes.Skill = new contentTypes.Skill();
      let testSkillObj:Object=skillData [i];
        
      if (testSkillObj ["title"]) {
        extractedTitle=new contentTypes.Title ({text : testSkillObj ["title"]["#text"]});
      } else {                
        newSkill.fromJSONObject(testSkillObj as contentTypes.Skill);
        replacementSkills.push(newSkill);          
      }    
    }

    let model = new SkillModel({ skills: replacementSkills });
    model = model.with({ resource: contentTypes.Resource.fromPersistence(a) });
    model = model.with({ guid: a.guid });
    model = model.with({ type: a.type });
    model = model.with({ title: extractedTitle });
    if (!isNullOrUndefined(a.lock)) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }
      
    return model;
  }
}

