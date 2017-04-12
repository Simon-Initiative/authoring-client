import * as Immutable from 'immutable';
import * as types from '../../../data/types';

export const OrgContentTypes = types.strEnum([
  'Item',
  'Section',
  'Sequence',
  'Module',
  'Organization'
]);

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
    
  static addTextObject (aText,aValue)
  {
    let newTextObject:Object=new Object ();
    newTextObject [aText]=new Object ();
    newTextObject [aText]["#text"]=aValue;
    return (newTextObject);
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
  toJSONObject (): Object {
      var ephemeral:Object=new Object ();
      
      ephemeral ["item"]=new Object ();
      ephemeral ["item"]["@scoring_mode"]=this.scoringMode;
      ephemeral ["item"]["resourceref"]=new Object ();
      ephemeral ["item"]["resourceref"]["@idref"]=this.resourceRef.idRef;
      
      return (ephemeral);
  }  
}

export class OrgSection extends OrgItem {
  constructor() {
      super ();
      this.orgType=OrgContentTypes.Section;
  }
    
  toJSONObject (): Object {
    let ephemeral:Object=new Object ();
    ephemeral ["@id"]=this.id;
    ephemeral ["#array"]=new Array ();      
    return (ephemeral);
  }     
}

export class OrgModule extends OrgItem {

  constructor() {
    super ();
    this.orgType=OrgContentTypes.Module;
  } 
    
  toJSONObject (): Object {
    let ephemeral:Object=new Object ();
    ephemeral ["@id"]=this.id;
    ephemeral ["#array"]=new Array ();      
    return (ephemeral);
  }     
}

export class OrgSequence extends OrgItem{    

  category:string="unassigned";
  audience:string="unassigned";
    
  constructor() {
   super ();      
   this.orgType=OrgContentTypes.Sequence;
  } 
    
  toJSONObject (): Object {
    let ephemeral:Object=new Object ();
    ephemeral ["@id"]=this.id;
    ephemeral ["@category"]=this.category;
    ephemeral ["@audience"]=this.audience;
    ephemeral ["#array"]=new Array ();      
    return (ephemeral);
  }    
}

export class OrgOrganization extends OrgSequence {
    
  version:string="unassigned";
  description:string="unassgined";
        
  constructor() {
    super ();      
    this.orgType=OrgContentTypes.Organization;
  }
    
  toJSONObject (): Object {
    let ephemeral:Object=new Object ();
    ephemeral ["organization"]=new Object ();  
    ephemeral ["organization"]["@id"]=this.id;
    ephemeral ["organization"]["@version"]=this.version;
    ephemeral ["organization"]["#array"]=new Array ();
    ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("title",this.title));
    ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("description",this.description));
    ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("audience",this.audience));      
    return (ephemeral);
  }  
}
