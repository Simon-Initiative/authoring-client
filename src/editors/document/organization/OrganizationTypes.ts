import * as Immutable from 'immutable';
import * as types from '../../../data/types';

export const OrgContentTypes = types.strEnum([
  'Item',
  'Section',
  'Sequence',
  'Module',
  'Organization'
])

export type OrgContentTypes = keyof typeof OrgContentTypes;

export class IDRef {
  idRef:string="null";    
}

export class OrgItem {
  orgType:OrgContentTypes=OrgContentTypes.Item;  
  title:string="unassigned";
  id:string="-1";    
  scoringMode : string ="default";
  children:Array<OrgItem>;
  resourceRef : IDRef;    
    
  constructor() {
    this.children = new Array ();
    this.resourceRef=new IDRef ();
  }
    
  addNode (aNode: OrgItem) {
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
  toExternalObject (): Object {
      var nodeObj=new Object ();
      
      nodeObj ["item"]=new Object ();
      nodeObj ["item"]["@scoring_mode"]=this.scoringMode;
      nodeObj ["item"]["resourceref"]=new Object ();
      nodeObj ["item"]["resourceref"]["@idref"]=this.resourceRef.idRef;
      
      return (nodeObj);
  }  
}

export class OrgSection extends OrgItem {
  constructor() {
      super ();
      this.orgType=OrgContentTypes.Section;
  }
}

export class OrgModule extends OrgItem {
  constructor() {
    super ();
    this.orgType=OrgContentTypes.Module;
  } 
}

export class OrgSequence extends OrgItem{    
  category:string="unassigned";
  audience:string="unassigned";
    
  constructor() {
   super ();      
   this.orgType=OrgContentTypes.Sequence;
  }    
}

export class OrgOrganization extends OrgSequence {
  constructor() {
    super ();      
    this.orgType=OrgContentTypes.Organization;
  }
        
  version:string="unassigned";
  description:string="unassgined";
}
