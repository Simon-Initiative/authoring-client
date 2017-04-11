
import * as Immutable from 'immutable';
import * as types from '../../../data/types';
import guid from '../../../utils/guid';

export const SkillTypes = types.strEnum([
  'Skill'
]);

export type SkillTypes = keyof typeof SkillTypes;

export class Skill {
  orgType:SkillTypes=SkillTypes.Skill;
      
  title:string="unassigned";
  id:string=guid();    
    
  // BKT probabilities
  pGuess:number=0.1;
  pKnown:number=0.25;
  pSlip:number=0.1;
  pMastery:number=0.95;
        
  constructor() {

  }
   
  /**
   * 
   */  
  toJSONObject (): Object {
    var ephemeral:Object=new Object ();
      
    ephemeral ["@id"]=this.id;
    ephemeral ["@title"]=this.title;
    ephemeral ["@pGuess"]=this.pGuess;
    ephemeral ["@pKnown"]=this.pKnown;
    ephemeral ["@pSlip"]=this.pSlip;
    ephemeral ["@pMastery"]=this.pMastery;
            
    return (ephemeral);
  }  
}
