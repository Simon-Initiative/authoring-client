
import * as Immutable from 'immutable';
import * as types from '../../../data/types';
import Linkable from '../../../data/linkable';
import guid from '../../../utils/guid';

export const SkillTypes = types.strEnum([
  'Skill'
]);

export type SkillTypes = keyof typeof SkillTypes;

export abstract class SkillModel {
    sType:string="Base";
    
  /**
   * 
   */  
  abstract toJSONObject (): Object;
    
  /**
   *
   */
  abstract increment (aValue:number): void;
     
  /**
   *
   */
  abstract decrement (aValue:number): void;
}

export class SkillModelBKT extends SkillModel {
    
  constructor () 
  {
    super ();
    this.sType="BKT";      
  }  
    
  // BKT probabilities
  pGuess:number=0.5;
  pKnown:number=0.25;
  pSlip:number=0.5;
  pMastery:number=0.95;
    
  /**
   * 
   */  
  toJSONObject (): Object {
    var ephemeral:Object=new Object ();

    ephemeral ["type"]=this.sType;  
    ephemeral ["@pGuess"]=this.pGuess;
    ephemeral ["@pKnown"]=this.pKnown;
    ephemeral ["@pSlip"]=this.pSlip;
    ephemeral ["@pMastery"]=this.pMastery;
            
    return (ephemeral);
  }
    
  /**
   *
   */
  increment (aValue:number) {
  }
    
  /**
   *
   */
  decrement (aValue:number) {
  }    
}

export class SkillModelOLI extends SkillModel {

  constructor () {
    super ();
    this.sType="OLI";      
  }    
  // OLI skill probabilities
  prob:number=0.70;
  gamma0:number=0.70;
  gamma1:number=0.70;
  lambda0:number=1.00;
    
  /**
   * 
   */  
  toJSONObject (): Object {
    var ephemeral:Object=new Object ();

    ephemeral ["type"]=this.sType;      
    ephemeral ["@p"]=this.prob;
    ephemeral ["@gamma0"]=this.gamma0;
    ephemeral ["@gamma1"]=this.gamma1;
    ephemeral ["@lambda0"]=this.lambda0;
            
    return (ephemeral);
  }
    
  /**
   *
   */
  increment (aValue:number) {
  }
    
  /**
   *
   */
  decrement (aValue:number) {
  }    
}    

export class Skill extends Linkable {
  orgType:SkillTypes=SkillTypes.Skill;
      
  title:string="unassigned";    
  skillModel:SkillModel=new SkillModelBKT ();
  folded:boolean=true;  
              
  constructor() {
    super ();
  }
   
  /**
   * 
   */  
  toJSONObject (): Object {
    var ephemeral:Object=new Object ();
      
    ephemeral ["@id"]=this.id;
    ephemeral ["@title"]=this.title;
    ephemeral ["#skillModel"]=this.skillModel.toJSONObject ();
            
    return (ephemeral);
  }  
    
  /**
   *
   */
  increment (aValue:number) {
      this.skillModel.increment (aValue);
  }
    
  /**
   *
   */    
  decrement (aValue:number) {
      this.skillModel.decrement (aValue);
  }    
}
