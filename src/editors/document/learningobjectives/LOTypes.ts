
import * as Immutable from 'immutable';
import * as types from '../../../data/types';
import {Skill} from '../skills/SkillTypes';
import guid from '../../../utils/guid';

export const LOTypes = types.strEnum([
  'LO'
]);

export type LOTypes = keyof typeof LOTypes;

export class LearningObjective {
  orgType:LOTypes=LOTypes.LO;  
  title:string="unassigned";
  id:string=guid();    
  category:string="unassigned";
  children:Array<LearningObjective>;
  skills:Array<string>=new Array (); // only a list of IDs not a list of pointers to skill objects
        
  constructor() {
    this.children = new Array ();
  }

  addNode (aNode: LearningObjective) {
      this.children.push (aNode);
  }
    
  isLeaf ():boolean {
    if (this.children.length==0) {
          return (true);
    }
      
    return (false);
  }
   
  /**
  * You can only call this if the node is a leaf node, or in other words
  * an OLI item
  */  
  toJSONObject (): Object {
    var ephemeral:Object=new Object ();
      
    ephemeral ["@id"]=this.id;
    ephemeral ["@category"]=this.category;
    ephemeral ["#text"]=this.title;
    ephemeral ["#skills"]=new Array<string>();
      
    for (var i=0;i<this.skills.length;i++) {
      
      ephemeral ["#skills"].push (this.skills [i]);
    }
      
    return (ephemeral);
  }  
}
