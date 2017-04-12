
import * as Immutable from 'immutable';
import * as types from '../../../data/types';

export const LOTypes = types.strEnum([
  'LO'
]);

export type LOTypes = keyof typeof LOTypes;

export class Skill {
    id:string="unassigned";
}

export class LearningObjective {
  orgType:LOTypes=LOTypes.LO;  
  title:string="unassigned";
  id:string="-1";    
  category:string="unassigned";
  children:Array<LearningObjective>;
  skills:Array<Skill>;
        
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
            
    return (ephemeral);
  }  
}
