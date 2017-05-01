
import * as Immutable from 'immutable';
import * as types from '../../../data/types';
import Linkable from '../../../data/linkable';
import {Skill} from '../../../data/skills';
import guid from '../../../utils/guid';

export const LOTypes = types.strEnum([
  'LO'
]);

export type LOTypes = keyof typeof LOTypes;

export class LearningObjective extends Linkable {
  orgType:LOTypes=LOTypes.LO;  
  title:string="unassigned";    
  category:string="unassigned";
  children:Array<LearningObjective>;
  skills:Array<string>=new Array (); // only a list of IDs not a list of pointers to skill objects
      
  /**
   * Constructor
   */     
  constructor() {
    super ();
    this.children = new Array ();
  }

  /**
   * 
   */     
  addNode (aNode: LearningObjective) {
      this.children.push (aNode);
  }
    
  /**
   * 
   */     
  isLeaf ():boolean {
    if (this.children.length==0) {
          return (true);
    }
      
    return (false);
  }
   
  /**
   * 
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
